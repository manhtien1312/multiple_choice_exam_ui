import { useState } from "react";
import { Link } from "react-router-dom";
import classNames from 'classnames/bind';
import styles from '../assets/css/ExpandableCard.module.scss';
import { motion } from 'framer-motion';

const cn = classNames.bind(styles);

const ExpandableCard = (prop) => {

    const [isExpanded, setIsExpanded] = useState(false);

    const animate = {
        layout: "position",
        animate: { opacity: 1 },
        transition: { delay: 0 },
        initial: { opacity: 0 },
    }

    return (
        <motion.div
            className={cn('activity-item')}
            layout
        >
            <motion.div layout="position" className={cn('shrink')}>
                <button
                    className={cn('btn-expand')}
                    onClick={() => {
                        setIsExpanded(!isExpanded)
                    }}
                >
                    {
                        isExpanded ? <i className="fa-solid fa-angle-down"></i> :
                            <i className="fa-solid fa-angle-right"></i>
                    }
                </button>
                <p>{prop.cardTitle}</p>
            </motion.div>

            {
                isExpanded &&
                <>
                    <motion.div {...animate} className={cn('expand')}>

                        {/*prop.listItem.map() ...*/}

                        <Link className={cn('expand-item')}>
                            <p className={cn('item-name')}>Bài ôn tập 1</p>
                        </Link>
                        <Link className={cn('expand-item')}>
                            <p className={cn('item-name')}>Bài ôn tập 1</p>
                        </Link>
                        <Link className={cn('expand-item')}>
                            <p className={cn('item-name')}>Bài ôn tập 1</p>
                        </Link>
                        <Link className={cn('expand-item')}>
                            <p className={cn('item-name')}>Bài ôn tập 1</p>
                        </Link>

                        <button className={cn('btn-add')}><i className="fa-solid fa-plus"></i>
                            Thêm
                        </button>
                    </motion.div>
                </>
            }
        </motion.div>
    );
};

export default ExpandableCard;