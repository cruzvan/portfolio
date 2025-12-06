
import React from 'react';
import BasePortfolioView from './BasePortfolioView';
import { techArtProjects } from '../data/projectData';

interface TechArt3DPortfolioViewProps {
  onClose: () => void;
}

const TechArt3DPortfolioView: React.FC<TechArt3DPortfolioViewProps> = ({ onClose }) => {
  const categories = [...new Set(techArtProjects.flatMap(project => project.tags))];

  return (
    <BasePortfolioView 
      title="3D & TECH ART"
      projects={techArtProjects}
      categories={categories}
      onClose={onClose}
      baseRoute="#3d-tech-art"
    />
  );
};

export default TechArt3DPortfolioView;