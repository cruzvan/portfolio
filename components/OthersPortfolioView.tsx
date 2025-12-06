
import React from 'react';
import BasePortfolioView from './BasePortfolioView';
import { othersProjects } from '../data/projectData';

interface OthersPortfolioViewProps {
  onClose: () => void;
}

const OthersPortfolioView: React.FC<OthersPortfolioViewProps> = ({ onClose }) => {
  const categories = [...new Set(othersProjects.flatMap(project => project.tags))];

  return (
    <BasePortfolioView 
      title="MISCELLANEOUS"
      projects={othersProjects}
      categories={categories}
      onClose={onClose}
      baseRoute="#others"
    />
  );
};

export default OthersPortfolioView;