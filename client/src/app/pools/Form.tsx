"use client";
import { FunctionComponent } from 'react';
import Image from 'next/image';
import styles from './Form.module.css';

const Form: FunctionComponent = () => {
  return (
    <div className={styles.form}>
      <div className={styles.icons}>
        <Image className={styles.vectorIcon} alt="success" src="/sucess.svg" width={24} height={24} />
      </div>
      <div className={styles.poolSubmitted}>Pool submitted</div>
      <div className={styles.poolSubmittedAnd}>Pool submitted and it is under the system review we&apos;ll notify you when the status changes.</div>
    </div>
  );
};

export default Form;