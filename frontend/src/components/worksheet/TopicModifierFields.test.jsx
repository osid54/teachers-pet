import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import TopicModifierFields, { DEFAULT_TOPIC_MODIFIERS } from './TopicModifierFields';

afterEach(cleanup);

function Settings({ topicId = 'addition', initial = {}, disabled = false }) {
    const [modifiers, setModifiers] = useState({ ...DEFAULT_TOPIC_MODIFIERS, ...initial });
    return <><TopicModifierFields topicId={topicId} modifiers={modifiers} onChange={setModifiers} disabled={disabled} />
        <output aria-label="Saved settings">{JSON.stringify(modifiers)}</output></>;
}

describe('plain-language number and answer settings', () => {
    it('saves percentage changes as per-number probability and hides unrelated answer rules', () => {
        render(<Settings />);
        expect(screen.getByRole('spinbutton', { name: 'Number of digits' })).toBeTruthy();
        expect(screen.queryByRole('group', { name: 'Division answers' })).toBeNull();
        expect(screen.queryByLabelText('Allow negative answers')).toBeNull();
        const chance = screen.getByRole('slider', { name: 'Chance of a negative number' });
        expect(chance.step).toBe('25');
        for (const percent of [25, 50, 75, 100, 0]) {
            fireEvent.change(chance, { target: { value: String(percent) } });
            expect(JSON.parse(screen.getByLabelText('Saved settings').textContent).negative_probability).toBe(percent / 100);
        }
        fireEvent.click(screen.getByRole('radio', { name: 'Exactly this many digits' }));
        expect(JSON.parse(screen.getByLabelText('Saved settings').textContent).digit_mode).toBe('strict');
    });

    it('resets incompatible number settings when remainders are selected', () => {
        render(<Settings topicId="division" initial={{ decimal_places: 2, negative_probability: 0.5 }} />);
        fireEvent.click(screen.getByRole('radio', { name: 'With remainders' }));
        expect(JSON.parse(screen.getByLabelText('Saved settings').textContent)).toMatchObject({
            division_mode: 'remainder', decimal_places: 0, negative_probability: 0,
        });
        expect(screen.getByRole('combobox', { name: 'Decimal places' }).disabled).toBe(true);
        expect(screen.getByRole('slider', { name: 'Chance of a negative number' }).disabled).toBe(true);
        expect(screen.queryByRole('combobox', { name: 'Round answers to' })).toBeNull();
        fireEvent.click(screen.getByRole('radio', { name: 'Decimals' }));
        expect(screen.getByRole('combobox', { name: 'Decimal places' }).disabled).toBe(false);
        expect(screen.getByRole('combobox', { name: 'Round answers to' }).disabled).toBe(false);
    });

    it('keeps rounding available in mixed shared settings even when division uses whole numbers', () => {
        render(<Settings topicId="all" />);
        const rounding = screen.getByRole('combobox', { name: 'Round answers to' });
        expect(rounding.disabled).toBe(false);
        fireEvent.change(rounding, { target: { value: '2' } });
        expect(JSON.parse(screen.getByLabelText('Saved settings').textContent).answer_rounding).toBe(2);
    });

    it('keeps parent-owned settings read-only', () => {
        render(<Settings topicId="subtraction" disabled />);
        expect(screen.getByRole('spinbutton', { name: 'Number of digits' }).disabled).toBe(true);
        expect(screen.getByRole('slider', { name: 'Chance of a negative number' }).disabled).toBe(true);
        expect(screen.getByRole('checkbox', { name: 'Allow negative answers' }).disabled).toBe(true);
    });
});