import React from 'react';
import ReactDOM from 'react-dom';

const ModalPortal = ({ children }) => {
    if (typeof document === 'undefined') return null;

    let portalRoot = document.getElementById('modal-root');
    if (!portalRoot) {
        portalRoot = document.createElement('div');
        portalRoot.id = 'modal-root';
        document.body.appendChild(portalRoot);
    }

    return ReactDOM.createPortal(children, portalRoot);
};

export default ModalPortal;