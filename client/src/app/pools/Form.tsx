"use client";
import { FunctionComponent } from 'react';
import styles from './Form.module.css';

const Form: FunctionComponent = () => {
  return (
    <div className={styles.form}>
      <div className={styles.icons}>
        <img className={styles.vectorIcon} alt="success" src="/sucess.svg" />
      </div>
      <div className={styles.poolSubmitted}>Pool submitted</div>
      <div className={styles.poolSubmittedAnd}>Pool submitted and it is under the system review we’ll notify you when the status changes.</div>
    </div>
  );
};

export default Form;
