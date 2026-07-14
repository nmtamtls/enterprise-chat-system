import React from 'react';
import EmojiPicker from 'emoji-picker-react';
import styles from '../../styles/Reaction.module.css';

const ReactionPicker = ({ onEmojiClick, onClose }) => {
  return (
    <div className={styles.pickerOverlay} onClick={onClose}>
      <div className={styles.pickerContainer} onClick={(e) => e.stopPropagation()}>
        <EmojiPicker 
          onEmojiClick={(emojiData) => {
            onEmojiClick(emojiData.emoji);
            onClose();
          }} 
          width={300}
        />
      </div>
    </div>
  );
};

export default ReactionPicker;