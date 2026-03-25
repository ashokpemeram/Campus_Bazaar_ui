export const validateName = (name) => /^[A-Za-z\s]+$/.test((name || '').trim());

export const validatePassword = (password) => {
    return (
        (password || '').length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[@$!%*?&]/.test(password)
    );
};
