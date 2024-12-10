import styles from "../assets/css/PracticeHeader.module.scss";

const PracticeHeader = () => {
    return (
        <header className={styles.header}>
            <h2>Practice Mode</h2>
            <p>Answer the questions to test your knowledge.</p>
        </header>
    );
};

export default PracticeHeader;
