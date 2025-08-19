import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 border border-gray-700 transform transition-transform duration-300 scale-95"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 id="modal-title" className="text-xl font-bold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Apply animation on modal open
const AnimatedModal: React.FC<ModalProps> = (props) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    if (props.isOpen) {
      setTimeout(() => setIsMounted(true), 10); // Allow for transition
    } else {
      setIsMounted(false);
    }
  }, [props.isOpen]);

  if (!props.isOpen && !isMounted) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300 ${isMounted && props.isOpen ? 'opacity-100' : 'opacity-0'}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={props.onClose}
    >
      <div
        className={`bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 border border-gray-700 transform transition-all duration-300 ${isMounted && props.isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 id="modal-title" className="text-xl font-bold text-white">
            {props.title}
          </h2>
          <button
            onClick={props.onClose}
            aria-label="Fechar modal"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-6">{props.children}</div>
      </div>
    </div>
  );
};


export default AnimatedModal;