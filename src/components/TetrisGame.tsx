import { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Tetromino } from '../types/tetris';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BLOCK_SIZE,
  createEmptyBoard,
  getRandomTetromino,
  canMovePiece,
  rotatePiece,
  mergePieceToBoard,
  clearLines,
  calculateScore,
  getDropSpeed,
} from '../utils/tetrisLogic';

interface TetrisGameProps {
  onGameOver: (score: number, lines: number, level: number) => void;
}

export default function TetrisGame({ onGameOver }: TetrisGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    level: 0,
    lines: 0,
    isGameOver: false,
    isPaused: false,
  });

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const drawBlock = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  }, []);

  const drawBoard = useCallback((ctx: CanvasRenderingContext2D, board: number[][]) => {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x]) {
          drawBlock(ctx, x, y, '#4a4a6a');
        }
      }
    }
  }, [drawBlock]);

  const drawPiece = useCallback((ctx: CanvasRenderingContext2D, piece: Tetromino) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          drawBlock(ctx, piece.position.x + x, piece.position.y + y, piece.color);
        }
      }
    }
  }, [drawBlock]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;

    drawBoard(ctx, state.board);

    if (state.currentPiece) {
      drawPiece(ctx, state.currentPiece);
    }
  }, [drawBoard, drawPiece]);

  const movePieceDown = useCallback(() => {
    const state = gameStateRef.current;

    if (!state.currentPiece || state.isGameOver || state.isPaused) return;

    const newY = state.currentPiece.position.y + 1;

    if (canMovePiece(state.board, state.currentPiece, state.currentPiece.position.x, newY)) {
      setGameState(prev => ({
        ...prev,
        currentPiece: prev.currentPiece
          ? { ...prev.currentPiece, position: { ...prev.currentPiece.position, y: newY } }
          : null,
      }));
    } else {
      const mergedBoard = mergePieceToBoard(state.board, state.currentPiece);
      const { newBoard, linesCleared } = clearLines(mergedBoard);
      const points = calculateScore(linesCleared, state.level);
      const newLines = state.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10);

      const nextPiece = state.nextPiece || getRandomTetromino();

      if (!canMovePiece(newBoard, nextPiece, nextPiece.position.x, nextPiece.position.y)) {
        setGameState(prev => ({
          ...prev,
          board: mergedBoard,
          isGameOver: true,
        }));
        onGameOver(state.score + points, newLines, newLevel);
        return;
      }

      setGameState(prev => ({
        ...prev,
        board: newBoard,
        currentPiece: nextPiece,
        nextPiece: getRandomTetromino(),
        score: prev.score + points,
        lines: newLines,
        level: newLevel,
      }));
    }
  }, [onGameOver]);

  const movePiece = useCallback((dx: number) => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;

      const newX = prev.currentPiece.position.x + dx;

      if (canMovePiece(prev.board, prev.currentPiece, newX, prev.currentPiece.position.y)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: { ...prev.currentPiece.position, x: newX },
          },
        };
      }

      return prev;
    });
  }, []);

  const rotate = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;

      const rotated = rotatePiece(prev.currentPiece);

      if (canMovePiece(prev.board, { ...prev.currentPiece, shape: rotated }, prev.currentPiece.position.x, prev.currentPiece.position.y)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            shape: rotated,
          },
        };
      }

      return prev;
    });
  }, []);

  const dropPiece = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;

      let newY = prev.currentPiece.position.y;
      while (canMovePiece(prev.board, prev.currentPiece, prev.currentPiece.position.x, newY + 1)) {
        newY++;
      }

      return {
        ...prev,
        currentPiece: {
          ...prev.currentPiece,
          position: { ...prev.currentPiece.position, y: newY },
        },
      };
    });

    setTimeout(movePieceDown, 50);
  }, [movePieceDown]);

  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameStateRef.current.isGameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePieceDown();
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          dropPiece();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, movePieceDown, rotate, dropPiece, togglePause]);

  useEffect(() => {
    if (!gameState.currentPiece && !gameState.isGameOver) {
      setGameState(prev => ({
        ...prev,
        currentPiece: getRandomTetromino(),
        nextPiece: getRandomTetromino(),
      }));
    }
  }, [gameState.currentPiece, gameState.isGameOver]);

  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused) return;

    const speed = getDropSpeed(gameState.level);
    const interval = setInterval(movePieceDown, speed);

    return () => clearInterval(interval);
  }, [gameState.level, gameState.isGameOver, gameState.isPaused, movePieceDown]);

  useEffect(() => {
    render();
  }, [gameState, render]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-gray-800 p-4 rounded-lg">
        <canvas
          ref={canvasRef}
          width={BOARD_WIDTH * BLOCK_SIZE}
          height={BOARD_HEIGHT * BLOCK_SIZE}
          className="border-2 border-gray-600"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-md text-center">
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-gray-400 text-sm">Score</div>
          <div className="text-2xl font-bold text-white">{gameState.score}</div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-gray-400 text-sm">Lines</div>
          <div className="text-2xl font-bold text-white">{gameState.lines}</div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-gray-400 text-sm">Level</div>
          <div className="text-2xl font-bold text-white">{gameState.level}</div>
        </div>
      </div>

      <div className="text-center text-gray-400 text-sm">
        <p>← → : Move | ↑ : Rotate | ↓ : Soft Drop</p>
        <p>Space : Hard Drop | P : Pause</p>
      </div>

      {gameState.isPaused && (
        <div className="text-xl font-bold text-yellow-400">PAUSED</div>
      )}

      {gameState.isGameOver && (
        <div className="text-xl font-bold text-red-400">GAME OVER</div>
      )}
    </div>
  );
}
