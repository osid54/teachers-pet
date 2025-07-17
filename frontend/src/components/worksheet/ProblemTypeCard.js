'use client';

import React from 'react'; 
import styles from '@/styles/components/worksheet/_problemTypeCard.module.scss';

export default function ProblemTypeCard({ topic, onSelect, isSelected }) { 

  const handleClick = () => {
    onSelect(topic);
  };

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
    >
      <h3 className={styles.title}>{topic.name}</h3>
      <p className={styles.description}>{topic.description}</p>
      {/* icon based on topic.id */}
      {isSelected && (
        <span className={styles.checkmark}>✔</span>
      )}
    </div>
  );
}