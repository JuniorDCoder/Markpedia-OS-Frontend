'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export function PasswordGenerator({ onSelect }: { onSelect?: (password: string) => void }) {
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [copied, setCopied] = useState(false);

    const generatePassword = () => {
        let charset = '';
        if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeNumbers) charset += '0123456789';
        if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (charset === '') {
            setGeneratedPassword('');
            return;
        }

        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setGeneratedPassword(password);
        setCopied(false);
    };

    const copyToClipboard = () => {
        if (!generatedPassword) return;
        navigator.clipboard.writeText(generatedPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        toast.success("Password copied to clipboard");

        if (onSelect) {
            onSelect(generatedPassword);
        }
    };

    // Generate on first render
    useState(() => {
        generatePassword();
    });

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="space-y-2">
                <Label>Generated Password</Label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            value={generatedPassword}
                            readOnly
                            className="font-mono pr-10"
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={generatePassword}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="default" size="icon" onClick={copyToClipboard}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label>Length: {length}</Label>
                    </div>
                    <Slider
                        value={[length]}
                        onValueChange={(value) => setLength(value[0])}
                        min={8}
                        max={32}
                        step={1}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="uppercase">Uppercase</Label>
                        <Switch
                            id="uppercase"
                            checked={includeUppercase}
                            onCheckedChange={setIncludeUppercase}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="lowercase">Lowercase</Label>
                        <Switch
                            id="lowercase"
                            checked={includeLowercase}
                            onCheckedChange={setIncludeLowercase}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="numbers">Numbers</Label>
                        <Switch
                            id="numbers"
                            checked={includeNumbers}
                            onCheckedChange={setIncludeNumbers}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="symbols">Symbols</Label>
                        <Switch
                            id="symbols"
                            checked={includeSymbols}
                            onCheckedChange={setIncludeSymbols}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
