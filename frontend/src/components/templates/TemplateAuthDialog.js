import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input } from '@/components/ui';
import SettingsModal from '@/components/worksheet/SettingsModal';

export default function TemplateAuthDialog({ onClose, onSignedIn }) {
    const { login, register, isLoading, error: authError } = useAuth();
    const [mode, setMode] = useState('login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [attempted, setAttempted] = useState(false);
    const [localError, setLocalError] = useState(null);
    const [notice, setNotice] = useState(null);
    const registering = mode === 'register';

    const switchMode = next => {
        setMode(next);
        setPassword('');
        setConfirmation('');
        setAttempted(false);
        setLocalError(null);
        setNotice(null);
    };
    const submit = async event => {
        event.preventDefault();
        setLocalError(null);
        setAttempted(false);
        if (registering && password !== confirmation) {
            setLocalError('Passwords do not match.');
            return;
        }
        const success = registering ? await register(username.trim(), password, email.trim()) : await login(username.trim(), password);
        if (!success) { setAttempted(true); return; }
        if (registering) {
            switchMode('login');
            setNotice('Account created. You can sign in now.');
        } else onSignedIn();
    };

    return (
        <SettingsModal title={registering ? 'Create an account' : 'Sign in'} onClose={onClose} onSubmit={submit}
            actions={<Button type="submit" isLoading={isLoading}>
                {registering ? <UserPlus aria-hidden="true" size={18} /> : <LogIn aria-hidden="true" size={18} />}
                {registering ? 'Create account' : 'Sign in'}
            </Button>}>
            <div className="grid grid-cols-2 overflow-hidden rounded-sm border border-main-300" role="group" aria-label="Account action">
                {[['login', 'Sign in'], ['register', 'Create account']].map(([value, label]) => <button key={value} type="button"
                    aria-label={value === 'login' ? 'Switch to sign in' : 'Switch to create account'}
                    aria-pressed={mode === value} disabled={isLoading} onClick={() => switchMode(value)}
                    className={`px-sm py-xs text-sm ${mode === value ? 'bg-main-300 text-main-800' : 'bg-main-100 text-main-600'}`}>{label}</button>)}
            </div>
            {notice && <p role="status" className="m-0 text-sm text-main-600">{notice}</p>}
            {(localError || attempted) && <p role="alert" className="m-0 text-sm text-main-700">{localError || authError || 'Unable to continue. Please check your details and try again.'}</p>}
            <Input label="Username" name="username" autoComplete="username" value={username} required minLength={3} maxLength={50} labelPosition="top" onChange={event => setUsername(event.target.value)} />
            {registering && <Input label="Email" name="email" type="email" autoComplete="email" value={email} required labelPosition="top" onChange={event => setEmail(event.target.value)} />}
            <Input label="Password" name="password" type="password" autoComplete={registering ? 'new-password' : 'current-password'} value={password}
                required minLength={registering ? 8 : undefined} labelPosition="top" onChange={event => setPassword(event.target.value)} />
            {registering && <Input label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" value={confirmation}
                required minLength={8} labelPosition="top" onChange={event => setConfirmation(event.target.value)} />}
        </SettingsModal>
    );
}