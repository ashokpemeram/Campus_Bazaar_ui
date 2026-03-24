const Skeleton = ({ width, height, borderRadius = '8px', className = '' }) => {
    return (
        <div 
            className={`skeleton ${className}`} 
            style={{ 
                width: width || '100%', 
                height: height || '200px', 
                borderRadius,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
                backgroundSize: '200% 100%',
                animation: 'skeleton-loading 1.5s infinite'
            }} 
        />
    );
};

export default Skeleton;
