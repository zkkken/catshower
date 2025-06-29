/**
 * 游戏结果模态框组件
 * 显示游戏结果并提供操作选项，替代原来的分数提交模态框
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState } from 'react';

interface GameResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitScore: (difficulty: 'easy' | 'medium' | 'hard') => Promise<any>;
  onPlayAgain: () => void;
  onBackToStart: () => void;
  gameStats: {
    roundsCompleted: number;
    totalTime: number;
    finalComfort: number;
  };
  playerInfo: {
    playerName: string;
    continentId: string;
    catAvatarId: string;
  } | null;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  isOpen,
  onClose,
  onSubmitScore,
  onPlayAgain,
  onBackToStart,
  gameStats,
  playerInfo,
}) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);

  const handleSubmitScore = async () => {
    if (!playerInfo || hasSubmitted) return;

    setIsSubmitting(true);
    try {
      const result = await onSubmitScore(difficulty);
      setSubmitResult(result);
      setHasSubmitted(true);
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Failed to submit score. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateEstimatedRawScore = (): number => {
    const baseScore = gameStats.roundsCompleted * 1000;
    const timeBonus = Math.max(0, (180 - gameStats.totalTime) * 10);
    const comboBonus = gameStats.roundsCompleted > 1 ? (gameStats.roundsCompleted - 1) * 500 : 0;
    const difficultyMultiplier = { easy: 1.0, medium: 1.5, hard: 2.0 }[difficulty];
    
    return Math.round((baseScore + timeBonus + comboBonus) * difficultyMultiplier);
  };

  const calculateEstimatedCompositeScore = (): number => {
    const rawScore = calculateEstimatedRawScore();
    const COMPOSITE_SCORE_MULTIPLIER = 10000000;
    return (gameStats.roundsCompleted * COMPOSITE_SCORE_MULTIPLIER) + rawScore;
  };

  if (!isOpen || !playerInfo) return null;

  const isSuccess = gameStats.roundsCompleted > 0 && gameStats.finalComfort >= 0.8;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`${isSuccess ? 'bg-gradient-to-r from-green-500 to-blue-600' : 'bg-gradient-to-r from-red-500 to-orange-600'} text-white p-6 rounded-t-lg`}>
          <div className="text-center">
            <div className="text-4xl mb-2">{isSuccess ? '🎉' : '😿'}</div>
            <h2 className="text-2xl font-bold">
              {isSuccess ? 'Great Job!' : 'Game Over'}
            </h2>
            <p className={`${isSuccess ? 'text-green-100' : 'text-red-100'} mt-1`}>
              {isSuccess ? 'You successfully completed the game!' : 'Better luck next time!'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Player info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-3xl mb-2">{playerInfo.catAvatarId}</div>
              <h3 className="font-bold text-gray-800 text-lg">{playerInfo.playerName}</h3>
              <p className="text-gray-600">From {playerInfo.continentId}</p>
            </div>
          </div>

          {/* Game stats */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-3">Your Performance</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Rounds Completed:</span>
                <span className="font-bold text-blue-600">{gameStats.roundsCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Time:</span>
                <span className="font-bold text-blue-600">{formatTime(gameStats.totalTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Final Comfort:</span>
                <span className="font-bold text-blue-600">{Math.round(gameStats.finalComfort * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Difficulty selection and score submission */}
          {!hasSubmitted && isSuccess && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Difficulty for Score Submission
              </label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      difficulty === level
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">
                      {level === 'easy' && '🟢'}
                      {level === 'medium' && '🟡'}
                      {level === 'hard' && '🔴'}
                    </div>
                    <div className="text-sm font-medium capitalize">{level}</div>
                    <div className="text-xs text-gray-500">
                      {level === 'easy' && '×1.0'}
                      {level === 'medium' && '×1.5'}
                      {level === 'hard' && '×2.0'}
                    </div>
                  </button>
                ))}
              </div>

              {/* Estimated scores */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-blue-600 mb-1">Estimated Scores</div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-blue-600">Raw Score: </span>
                      <span className="text-lg font-bold text-blue-700">
                        {calculateEstimatedRawScore().toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-blue-600">Composite Score: </span>
                      <span className="text-lg font-bold text-blue-700">
                        {calculateEstimatedCompositeScore().toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-blue-500 mt-2">
                    Ranking priority: Rounds first, then raw score
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmitScore}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg font-medium mb-4"
              >
                {isSubmitting ? 'Submitting...' : '🏆 Submit to Leaderboard'}
              </button>
            </div>
          )}

          {/* Submission result */}
          {hasSubmitted && submitResult && (
            <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
              <div className="text-center">
                <div className="text-green-800 font-bold text-lg mb-2">Score Submitted!</div>
                <div className="space-y-1 text-sm text-green-700">
                  <div>Your Rank: #{submitResult.rank}</div>
                  <div>Raw Score: {submitResult.score.toLocaleString()}</div>
                  <div>Composite Score: {submitResult.compositeScore.toLocaleString()}</div>
                  {submitResult.isNewRecord && (
                    <div className="text-green-600 font-bold">🎉 New Personal Record!</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={onPlayAgain}
              className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
            >
              🎮 Play Again
            </button>
            
            <button
              onClick={onBackToStart}
              className="w-full px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
            >
              🏠 Back to Start Screen
            </button>
            
            <button
              onClick={onClose}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

