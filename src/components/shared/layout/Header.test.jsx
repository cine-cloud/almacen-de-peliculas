import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header.jsx';

// Mock de hooks
vi.mock('@/hooks/useKeycloak.js', () => ({
    useKeycloak: () => ({
        keycloak: {},
        initialized: true,
        authenticated: false,
        isAdmin: () => false,
        isCliente: () => false,
    }),
}));

vi.mock('@/hooks/useCart.jsx', () => ({
    useCart: () => ({
        getCartItemsCount: () => 0,
    }),
}));

describe('Componente Header', () => {
    it('debe renderizar el título de la aplicación "Cine Cloud"', () => {
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );

        expect(screen.getByText('Cine Cloud')).toBeInTheDocument();
    });

    it('debe mostrar el botón de Iniciar Sesión cuando el usuario no está autenticado', () => {
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );

        expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    });
});
