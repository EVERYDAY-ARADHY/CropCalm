import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function MorphicNavbar({
  items,
  defaultPath = "/",
  className,
}) {
  const location = useLocation();
  const [activePath, setActivePath] = useState(location.pathname || defaultPath);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const isActiveLink = (path) => {
    if (path === "/") {
      return activePath === "/";
    }
    return activePath.startsWith(path);
  };

  return (
    <nav className={cn("mx-auto max-w-4xl px-4 py-2", className)}>
      <div className="flex items-center justify-center">
        <div className="flex items-center justify-between overflow-hidden rounded-xl">
          {Object.entries(items).map(([path, { name }], index, array) => {
            const isActive = isActiveLink(path);
            const isFirst = index === 0;
            const isLast = index === array.length - 1;
            const prevPath = index > 0 ? array[index - 1][0] : null;
            const nextPath =
              index < array.length - 1 ? array[index + 1][0] : null;

            return (
              <Link
                className={cn(
                  "flex items-center justify-center bg-neo-surface p-1.5 px-4 text-xs font-subheading tracking-widest uppercase text-neo-cream transition-all duration-300",
                  isActive
                    ? "mx-2 rounded-xl font-bold bg-neo-green-dark border-neo-cream shadow-[2px_2px_0px_var(--color-neo-cream)]"
                    : cn(
                        (isActiveLink(prevPath || "") || isFirst) &&
                          "rounded-l-xl",
                        (isActiveLink(nextPath || "") || isLast) &&
                          "rounded-r-xl"
                      )
                )}
                to={path}
                key={path}
                onClick={() => setActivePath(path)}
              >
                {name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default MorphicNavbar;
