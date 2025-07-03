'use client';

import styles from '@/styles/components/worksheet/_problemTypeCard.module.scss';
import { useState } from 'react'; 

export default function ProblemTypeCard({ topic, onSelect }) {
  // const [isSelected, setIsSelected] = useState(false);

  const handleClick = () => {
    // setIsSelected(!isSelected);
    onSelect(topic.id);
  };

  return (
    <div className={styles.card} onClick={handleClick}>
      <h3 className={styles.title}>{topic.name}</h3>
      <p className={styles.description}>{topic.description}</p>
      {/* Icon  based on topic.id */}
      {/* <button className={styles.selectButton}>Select</button> */}
    </div>
  );
}