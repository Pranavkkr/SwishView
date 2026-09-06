import React from 'react';

const Avatar = ({ name, size = 'md', className = '' }) => {
  if (!name) name = 'User';

  const parts = name.trim().split(/\s+/);
  let initials = parts[0].charAt(0).toUpperCase();
  if (parts.length > 1) {
    initials += parts[parts.length - 1].charAt(0).toUpperCase();
  } else if (name.length > 1) {
    initials += name.charAt(1).toUpperCase();
  }

  // Consistent color based on name
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const bgColor = colors[colorIndex];

  // Size map
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl',
    '3xl': 'w-32 h-32 text-4xl'
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className={`rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${bgColor} ${sizeClass} ${className}`}>
      {initials}
    </div>
  );
};

export default Avatar;
