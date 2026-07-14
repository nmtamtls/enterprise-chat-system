import React from 'react';
import styles from '../../styles/Reaction.module.css';

const ReactionDisplay = ({ reactions }) => {
  if (!reactions || reactions.length === 0) return null;

  // Nhóm các reaction theo emoji để đếm số lượng
  const groupedReactions = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={styles.reactionList}>
      {Object.entries(groupedReactions).map(([emoji, count]) => (
        <span key={emoji} className={styles.reactionItem}>
          {emoji} <span className={styles.count}>{count > 1 ? count : ''}</span>
        </span>
      ))}
    </div>
  );
};

export default ReactionDisplay;