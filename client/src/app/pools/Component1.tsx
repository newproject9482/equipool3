import { FunctionComponent } from 'react';
import styles from './Component1.module.css';

const Component1: FunctionComponent = () => {
  return (
    <div className={styles.div}>{`>`}</div>
  );
};

export default Component1;
