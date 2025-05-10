import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  rounded?: boolean
  advanced?: boolean
  advancedDivColor?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  rounded = false,
  advanced = false,
  className,
  advancedDivColor = '',
  ...props
}) => {
  const sizeStyles = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-4 py-2 text-base font-semibold',
    large: 'px-6 py-3 text-lg font-semibold'
  }

  const baseStyles = `rounded focus:outline-none  ${rounded ? 'rounded-full' : ''}`

  const variantStyles = {
    primary: 'bg-button text-button-text ring-secondary ring-2',
    secondary: 'bg-button-secondary text-secondary ring-secondary ring-2',
    danger: 'bg-danger text-danger ring-danger ring-2'
  }

  const advancedStyles = advanced ? 'relative hover:shadow-lg transition-shadow duration-300 group' : ''; // group class still needed for button hover effect if you keep it

  const buttonStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className} ${advancedStyles}`;

  const renderButton = () => (
    <button className={buttonStyles} {...props}>
      {children}
    </button>
  );

  if (advanced) {
    return (
      <div className={`${advancedDivColor} rounded-full relative overflow-hidden`}> {/* Div wrapper with ripple effect and overflow-hidden */}
        <span className="absolute inset-0 pointer-events-none before:absolute before:-inset-1 before:bg-button before:opacity-10 before:rounded-full before:scale-0 before:origin-center before:animate-pulse-ripple"></span>
        {renderButton()}
      </div>
    );
  } else {
    return renderButton();
  }
}

export default Button