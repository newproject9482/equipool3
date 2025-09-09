import { FunctionComponent } from 'react';
import styles from './Button.module.css';

const Button: FunctionComponent<{onClick?: () => void}> = ({ onClick }) => {
  return (
    <div className={styles.button} onClick={onClick} role="button">
      <div className={styles.close} />
      <div className={styles.text}>Proceed</div>
      <div className={styles.close} />
    </div>
  );
};

export default Button;
