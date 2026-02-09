'use client';

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Eye,
    EyeOff,
    Copy,
    Check,
    RefreshCw,
    Wand2,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordGeneratorProps {
    value: string;
    onChange: (password: string) => void;
    minLength?: number;
}

interface PasswordOptions {
    length: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
}

type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong' | 'excellent';

function getCharacterPool(options: PasswordOptions): string {
    let pool = '';
    if (options.lowercase) pool += 'abcdefghijklmnopqrstuvwxyz';
    if (options.uppercase) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.numbers) pool += '0123456789';
    if (options.symbols) pool += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    return pool;
}

function generatePassword(options: PasswordOptions): string {
    const pool = getCharacterPool(options);
    if (!pool) return '';

    // Build guaranteed characters (one from each enabled set)
    const guaranteed: string[] = [];
    if (options.lowercase) guaranteed.push(pickRandom('abcdefghijklmnopqrstuvwxyz'));
    if (options.uppercase) guaranteed.push(pickRandom('ABCDEFGHIJKLMNOPQRSTUVWXYZ'));
    if (options.numbers) guaranteed.push(pickRandom('0123456789'));
    if (options.symbols) guaranteed.push(pickRandom('!@#$%^&*()_+-=[]{}|;:,.<>?'));

    // Fill remaining length from the full pool
    const remaining = options.length - guaranteed.length;
    const chars = [...guaranteed];
    for (let i = 0; i < remaining; i++) {
        chars.push(pickRandom(pool));
    }

    // Shuffle using Fisher-Yates
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('');
}

function pickRandom(str: string): string {
    return str[Math.floor(Math.random() * str.length)];
}

function evaluateStrength(password: string): { level: StrengthLevel; score: number; label: string } {
    if (!password) return { level: 'weak', score: 0, label: 'No password' };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    // Bonus for variety
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.6) score += 1;

    if (score <= 2) return { level: 'weak', score: 25, label: 'Weak' };
    if (score <= 4) return { level: 'fair', score: 50, label: 'Fair' };
    if (score <= 5) return { level: 'good', score: 65, label: 'Good' };
    if (score <= 7) return { level: 'strong', score: 85, label: 'Strong' };
    return { level: 'excellent', score: 100, label: 'Excellent' };
}

const strengthConfig: Record<StrengthLevel, { color: string; bgColor: string; barColor: string; icon: typeof Shield }> = {
    weak: { color: 'text-red-600', bgColor: 'bg-red-50 border-red-200', barColor: 'bg-red-500', icon: ShieldAlert },
    fair: { color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200', barColor: 'bg-orange-500', icon: Shield },
    good: { color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200', barColor: 'bg-yellow-500', icon: Shield },
    strong: { color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', barColor: 'bg-green-500', icon: ShieldCheck },
    excellent: { color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-200', barColor: 'bg-emerald-500', icon: ShieldCheck },
};

export function PasswordGenerator({ value, onChange, minLength = 8 }: PasswordGeneratorProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);
    const [options, setOptions] = useState<PasswordOptions>({
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
    });

    const strength = evaluateStrength(value);
    const config = strengthConfig[strength.level];
    const StrengthIcon = config.icon;

    const handleGenerate = useCallback(() => {
        const password = generatePassword(options);
        onChange(password);
    }, [options, onChange]);

    const handleCopy = useCallback(async () => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = value;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [value]);

    const updateOption = <K extends keyof PasswordOptions>(key: K, val: PasswordOptions[K]) => {
        setOptions(prev => {
            const next = { ...prev, [key]: val };
            // Ensure at least one character type is enabled
            const hasAny = next.uppercase || next.lowercase || next.numbers || next.symbols;
            if (!hasAny) return prev;
            // Ensure length is at least minLength
            if (key === 'length' && (val as number) < minLength) {
                next.length = minLength;
            }
            return next;
        });
    };

    // Auto-generate on first open of generator
    useEffect(() => {
        if (showGenerator && !value) {
            handleGenerate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showGenerator]);

    const enabledCount = [options.uppercase, options.lowercase, options.numbers, options.symbols].filter(Boolean).length;

    return (
        <div className="space-y-3">
            {/* Password Input Row */}
            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter or generate a password"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="pl-9 pr-20 font-mono"
                            required
                        />
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    'h-7 w-7 transition-colors',
                                    copied ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'
                                )}
                                onClick={handleCopy}
                                disabled={!value}
                                title="Copy password"
                            >
                                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant={showGenerator ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                            'gap-1.5 shrink-0 transition-all',
                            showGenerator && 'bg-primary text-primary-foreground shadow-md'
                        )}
                        onClick={() => setShowGenerator(!showGenerator)}
                    >
                        <Wand2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Generator</span>
                    </Button>
                </div>
            </div>

            {/* Strength Indicator */}
            {value && (
                <div className={cn('flex items-center gap-3 p-2.5 rounded-lg border transition-all', config.bgColor)}>
                    <StrengthIcon className={cn('h-4 w-4 shrink-0', config.color)} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className={cn('text-xs font-semibold', config.color)}>{strength.label}</span>
                            <span className="text-xs text-muted-foreground">{strength.score}%</span>
                        </div>
                        <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                            <div
                                className={cn('h-full rounded-full transition-all duration-500 ease-out', config.barColor)}
                                style={{ width: `${strength.score}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Generator Panel */}
            {showGenerator && (
                <div className="border rounded-xl bg-gradient-to-b from-muted/30 to-muted/10 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Wand2 className="h-4 w-4 text-primary" />
                            Password Generator
                        </h4>
                        <Button
                            type="button"
                            size="sm"
                            className="gap-1.5 shadow-sm"
                            onClick={handleGenerate}
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Generate
                        </Button>
                    </div>

                    {/* Length Slider */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-muted-foreground">Password Length</Label>
                            <Badge variant="secondary" className="tabular-nums text-xs font-bold px-2.5">
                                {options.length}
                            </Badge>
                        </div>
                        <Slider
                            value={[options.length]}
                            onValueChange={([v]) => updateOption('length', v)}
                            min={minLength}
                            max={64}
                            step={1}
                            className="w-full"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground/60 px-0.5">
                            <span>{minLength}</span>
                            <span>32</span>
                            <span>64</span>
                        </div>
                    </div>

                    {/* Character Options */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Character Types</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {([
                                { key: 'uppercase' as const, label: 'Uppercase', sample: 'A-Z' },
                                { key: 'lowercase' as const, label: 'Lowercase', sample: 'a-z' },
                                { key: 'numbers' as const, label: 'Numbers', sample: '0-9' },
                                { key: 'symbols' as const, label: 'Symbols', sample: '!@#$' },
                            ] as const).map(({ key, label, sample }) => (
                                <label
                                    key={key}
                                    className={cn(
                                        'flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all',
                                        options[key]
                                            ? 'bg-primary/5 border-primary/30 shadow-sm'
                                            : 'bg-background hover:bg-muted/50 border-border',
                                        enabledCount <= 1 && options[key] && 'cursor-not-allowed opacity-70'
                                    )}
                                >
                                    <Switch
                                        checked={options[key]}
                                        onCheckedChange={(v) => updateOption(key, v)}
                                        disabled={enabledCount <= 1 && options[key]}
                                        className="scale-75"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-medium block">{label}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono">{sample}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Quick presets */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Quick Presets</Label>
                        <div className="flex flex-wrap gap-1.5">
                            {[
                                {
                                    label: 'Simple',
                                    opts: { length: 10, uppercase: true, lowercase: true, numbers: true, symbols: false },
                                },
                                {
                                    label: 'Strong',
                                    opts: { length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true },
                                },
                                {
                                    label: 'Ultra',
                                    opts: { length: 32, uppercase: true, lowercase: true, numbers: true, symbols: true },
                                },
                                {
                                    label: 'PIN',
                                    opts: { length: 8, uppercase: false, lowercase: false, numbers: true, symbols: false },
                                },
                            ].map(({ label, opts }) => (
                                <Button
                                    key={label}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7 px-3 rounded-full"
                                    onClick={() => {
                                        setOptions(opts);
                                        const pw = generatePassword(opts);
                                        onChange(pw);
                                    }}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
