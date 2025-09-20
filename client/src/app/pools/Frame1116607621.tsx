import { FunctionComponent, KeyboardEvent } from 'react';
import styles from './Frame1116607621.module.css';
import Component1 from './Component1';

type Props = {
  currentStep: number;
  onStepClick?: (step: number) => void;
};

const Frame1116607621: FunctionComponent<Props> = ({ currentStep, onStepClick }) => {
  const stepClass = (step: number) => {
    return `${styles.textWrapper} ${currentStep >= step ? styles.active : ''}`;
  };

  const rootClass = `${styles.frameParent} ${styles.fitAll}`;

  const handleKey = (e: KeyboardEvent<HTMLDivElement>, step: number) => {
    if (!onStepClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onStepClick(step);
    }
  };

  return (
    <div className={rootClass}>
  <div className={styles.frameGroup}>
        <div
          className={stepClass(1)}
          role={onStepClick ? 'button' : undefined}
          tabIndex={onStepClick ? 0 : -1}
          onClick={onStepClick ? () => onStepClick(1) : undefined}
          onKeyDown={onStepClick ? (e) => handleKey(e, 1) : undefined}
          style={onStepClick ? { cursor: 'pointer' } : undefined}
        >
          <div className={styles.text}>1</div>
        </div>
        <div className={styles.investorsCardDescription}>Pool Type</div>
      </div>
  <Component1 />

  <div className={styles.frameGroup}>
        <div
          className={stepClass(2)}
          role={onStepClick ? 'button' : undefined}
          tabIndex={onStepClick ? 0 : -1}
          onClick={onStepClick ? () => onStepClick(2) : undefined}
          onKeyDown={onStepClick ? (e) => handleKey(e, 2) : undefined}
          style={onStepClick ? { cursor: 'pointer' } : undefined}
        >
          <div className={styles.text}>2</div>
        </div>
        <div className={styles.investorsCardDescription}>Property Info</div>
      </div>
  <Component1 />

  <div className={styles.frameGroup}>
        <div
          className={stepClass(3)}
          role={onStepClick ? 'button' : undefined}
          tabIndex={onStepClick ? 0 : -1}
          onClick={onStepClick ? () => onStepClick(3) : undefined}
          onKeyDown={onStepClick ? (e) => handleKey(e, 3) : undefined}
          style={onStepClick ? { cursor: 'pointer' } : undefined}
        >
          <div className={styles.text}>3</div>
        </div>
        <div className={styles.investorsCardDescription}>Pool Terms</div>
      </div>
  <Component1 />

  <div className={styles.frameGroup}>
        <div
          className={stepClass(4)}
          role={onStepClick ? 'button' : undefined}
          tabIndex={onStepClick ? 0 : -1}
          onClick={onStepClick ? () => onStepClick(4) : undefined}
          onKeyDown={onStepClick ? (e) => handleKey(e, 4) : undefined}
          style={onStepClick ? { cursor: 'pointer' } : undefined}
        >
          <div className={styles.text}>4</div>
        </div>
        <div className={styles.investorsCardDescription}>Documents</div>
      </div>
  <Component1 />

  <div className={styles.frameGroup}>
        <div
          className={stepClass(5)}
          role={onStepClick ? 'button' : undefined}
          tabIndex={onStepClick ? 0 : -1}
          onClick={onStepClick ? () => onStepClick(5) : undefined}
          onKeyDown={onStepClick ? (e) => handleKey(e, 5) : undefined}
          style={onStepClick ? { cursor: 'pointer' } : undefined}
        >
          <div className={styles.text}>5</div>
        </div>
        <div className={styles.investorsCardDescription}>Liability &amp; Credit Info</div>
      </div>
  <Component1 />

      <div className={styles.frameGroup}>
        <div
          className={`${styles.textWrapper4} ${currentStep >= 6 ? styles.active : ''}`}
          role={onStepClick ? 'button' : undefined}
          tabIndex={onStepClick ? 0 : -1}
          onClick={onStepClick ? () => onStepClick(6) : undefined}
          onKeyDown={onStepClick ? (e) => handleKey(e, 6) : undefined}
          style={onStepClick ? { cursor: 'pointer' } : undefined}
        >
          <div className={styles.text}>6</div>
        </div>
        <div className={styles.investorsCardDescription}>Review</div>
      </div>
  {/* toggle removed: header always minimized */}
    </div>
  );
};

export default Frame1116607621;
