import React, { useEffect } from 'react';
import './flytocart.css';

type FlyDetail = {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const FlyToCart: React.FC = () => {
  useEffect(() => {
    const handler = (ev: Event) => {
      try {
        // @ts-ignore - evento custom con detalle
        const detail: FlyDetail = ev.detail;
        if (!detail || !detail.src) return;

        const cartBtn = document.querySelector(
          '.cart-btn-small'
        ) as HTMLElement | null;
        if (!cartBtn) return;

        const targetRect = cartBtn.getBoundingClientRect();

        const startX = detail.x + window.scrollX;
        const startY = detail.y + window.scrollY;
        const startW = detail.width;
        const startH = detail.height;

        const endX = targetRect.left + targetRect.width / 2 + window.scrollX;
        const endY = targetRect.top + targetRect.height / 2 + window.scrollY;

        const img = document.createElement('img');
        img.src = detail.src;
        img.className = 'fly-image';
        img.style.width = `${startW}px`;
        img.style.height = `${startH}px`;
        img.style.left = `${startX}px`;
        img.style.top = `${startY}px`;
        img.style.position = 'absolute';
        img.style.zIndex = '9999';
        img.style.pointerEvents = 'none';
        img.style.transition =
          'transform 700ms cubic-bezier(.2,.9,.2,1), opacity 400ms ease-in';

        document.body.appendChild(img);

        // Force layout then animate
        requestAnimationFrame(() => {
          const dx = endX - (startX + startW / 2);
          const dy = endY - (startY + startH / 2);
          const scale = 0.18; // pequeño al llegar
          img.style.transform = `translate(${dx}px, ${dy}px) scale(${scale}) rotate(15deg)`;
          img.style.opacity = '0.6';
        });

        // Remover después de la animación
        const removeTimeout = window.setTimeout(() => {
          img.style.opacity = '0';
          // pequeño delay antes de eliminar
          setTimeout(() => {
            if (img && img.parentNode) img.parentNode.removeChild(img);
          }, 200);
          clearTimeout(removeTimeout);
        }, 800);
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener('fly-to-cart', handler as EventListener);
    return () => {
      window.removeEventListener('fly-to-cart', handler as EventListener);
    };
  }, []);

  return null;
};

export default FlyToCart;
