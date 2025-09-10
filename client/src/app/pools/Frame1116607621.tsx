import { FunctionComponent } from 'react';
import styles from './Frame1116607621.module.css';
import Component1 from './Component1';

const Frame1116607621: FunctionComponent<{ currentStep: number }> = ({ currentStep }) => {
  const stepClass = (step: number) => {
    return `${styles.textWrapper} ${currentStep >= step ? styles.active : ''}`;
  };

  const rootClass = `${styles.frameParent} ${styles.fitAll}`;

  return (
    <div className={rootClass}>
  <div className={styles.frameGroup}>
        <div className={stepClass(1)}>
          <div className={styles.text}>1</div>
        </div>
        <div className={styles.investorsCardDescription}>Pool Type</div>
      </div>
  <Component1 />

  <div className={styles.frameGroup}>
        <div className={stepClass(2)}>
          <div className={styles.text}>2</div>
        </div>
        <div className={styles.investorsCardDescription}>Property Info</div>
      </div>
  <Component1 />

  <div className={styles.frameGroup}>
        <div className={stepClass(3)}>
          <div className={styles.text}>3</div>
        </div>
        <div className={styles.investorsCardDescription}>Pool Terms</div>
      </div>
  <Component1 />

  <div className={styles.frameGroup}>
        <div className={stepClass(4)}>
          <div className={styles.text}>4</div>
        </div>
        <div className={styles.investorsCardDescription}>Documents</div>
      </div>
  <Component1 />

  <div className={styles.frameGroup}>
        <div className={stepClass(5)}>
          <div className={styles.text}>5</div>
        </div>
        <div className={styles.investorsCardDescription}>Liability &amp; Credit Info</div>
      </div>
  <Component1 />

      <div className={styles.frameGroup}>
        <div className={`${styles.textWrapper4} ${currentStep >= 6 ? styles.active : ''}`}>
          <div className={styles.text}>6</div>
        </div>
        <div className={styles.investorsCardDescription}>Review</div>
      </div>
  {/* toggle removed: header always minimized */}
    </div>
  );
};

export default Frame1116607621;
