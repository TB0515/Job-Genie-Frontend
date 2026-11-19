import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WishlistGenerator from '../WishlistGenerator';

describe('WishlistGenerator', () => {
	beforeEach(() => {
		// Reset fetch mock before each test
		globalThis.fetch = vi.fn();
	});

	it('still submits when role keywords are empty (backend applies default titles)', async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					success: true,
					total: 1,
					companies: [{ id: '1', name: 'Test Co' }],
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, results: [] }),
			});

		render(<WishlistGenerator />);

		const input = screen.getByLabelText(/role keywords/i);
		const button = screen.getByRole('button', { name: /generate wishlist/i });

		// Clear input and submit
		fireEvent.change(input, { target: { value: '' } });
		fireEvent.click(button);

		await waitFor(() => {
			expect(globalThis.fetch).toHaveBeenNthCalledWith(
				2,
				expect.stringContaining('/jobs'),
				expect.objectContaining({
					body: expect.stringContaining('"jobTitles":[]'),
				})
			);
		});
	});

	it('generates wishlist successfully', async () => {
		// Mock successful API responses
		globalThis.fetch = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					success: true,
					total: 2,
					companies: [
						{ id: '1', name: 'Company A' /* ... */ },
						{ id: '2', name: 'Company B' /* ... */ },
					],
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					success: true,
					results: [],
				}),
			});

		render(<WishlistGenerator />);

		const button = screen.getByRole('button', { name: /generate wishlist/i });
		fireEvent.click(button);

		await waitFor(() => {
			expect(
				screen.getByText(/successfully generated wishlist with 2 companies/i)
			).toBeInTheDocument();
		});
	});

	it('handles jobs fetch failure gracefully', async () => {
		// Mock wishlist success, jobs failure
		globalThis.fetch = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					success: true,
					total: 1,
					companies: [{ id: '1', name: 'Test Co' /* ... */ }],
				}),
			})
			.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ success: false }),
			});

		render(<WishlistGenerator />);

		const button = screen.getByRole('button', { name: /generate wishlist/i });
		fireEvent.click(button);

		await waitFor(() => {
			// Should still show success
			expect(screen.getByText(/couldn't load job roles/i)).toBeInTheDocument();
			// Should NOT show error
			expect(screen.queryByText(/failed to generate/i)).not.toBeInTheDocument();
		});
	});

	it('retries fetching job roles after a failure', async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					success: true,
					total: 1,
					companies: [{ id: '1', name: 'Test Co' }],
				}),
			})
			.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ success: false }),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, results: [] }),
			});

		render(<WishlistGenerator />);
		fireEvent.click(screen.getByRole('button', { name: /generate wishlist/i }));

		fireEvent.click(await screen.findByRole('button', { name: /retry/i }));

		await waitFor(() => {
			expect(
				screen.queryByText(/couldn't load job roles/i)
			).not.toBeInTheDocument();
		});
		expect(globalThis.fetch).toHaveBeenCalledTimes(3);
	});
});
