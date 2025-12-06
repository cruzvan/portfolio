
import React from 'react';
import BasePortfolioView from './BasePortfolioView';
import { gameDesignProjects } from '../data/projectData';

interface GameDesignPortfolioViewProps {
  onClose: () => void;
}

const GameDesignPortfolioView: React.FC<GameDesignPortfolioViewProps> = ({ onClose }) => {
  const categories = [...new Set(gameDesignProjects.flatMap(p => p.tags))];

  return (
    <BasePortfolioView 
      title="GAME DESIGN"
      projects={gameDesignProjects}
      categories={categories}
      onClose={onClose}
      baseRoute="#game-design"
    />
  );
};

export default GameDesignPortfolioView;