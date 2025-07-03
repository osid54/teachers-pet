import styles from '@/styles/components/worksheet/_subjectHeader.module.scss';

export default function SubjectHeader({ title }) {
    return (
      <h2 className={styles.header}>{title}</h2>
    );
  }