'use client';

import { useState } from 'react';
import { PasswordEntry } from '@/lib/api/passwords';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MoreVertical,
    Search,
    Copy,
    ExternalLink,
    Star,
    Trash2,
    Edit,
    Globe,
    Briefcase,
    User,
    CreditCard,
    Users,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface PasswordListProps {
    passwords: PasswordEntry[];
    onEdit: (password: PasswordEntry) => void;
    onDelete: (password: PasswordEntry) => void;
}

const CategoryIcon = ({ category }: { category?: string }) => {
    switch (category) {
        case 'work': return <Briefcase className="h-4 w-4" />;
        case 'personal': return <User className="h-4 w-4" />;
        case 'finance': return <CreditCard className="h-4 w-4" />;
        case 'social': return <Users className="h-4 w-4" />;
        default: return <Lock className="h-4 w-4" />;
    }
};

const CategoryBadge = ({ category }: { category?: string }) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    switch (category) {
        case 'work': variant = "default"; break;
        case 'finance': variant = "secondary"; break;
        case 'personal': variant = "outline"; break;
    }
    return (
        <Badge variant={variant} className="capitalize flex items-center gap-1 w-fit">
            <CategoryIcon category={category} />
            {category}
        </Badge>
    );
};



// ... (existing imports)

import toast from 'react-hot-toast';

export function PasswordList({ passwords, onEdit, onDelete }: PasswordListProps) {
    const [search, setSearch] = useState('');
    const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

    const toggleReveal = (id: string) => {
        const newRevealed = new Set(revealedIds);
        if (newRevealed.has(id)) {
            newRevealed.delete(id);
        } else {
            newRevealed.add(id);
        }
        setRevealedIds(newRevealed);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Password copied to clipboard");
    };

    const filteredPasswords = passwords.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.username?.toLowerCase().includes(search.toLowerCase()) ||
        p.website?.toLowerCase().includes(search.toLowerCase())
    );

    if (passwords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/10 text-center p-8">
                <Lock className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg">No passwords saved</h3>
                <p className="text-muted-foreground text-sm max-w-sm mt-2">
                    Safely store your credentials here. Click "Add Password" to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search passwords..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPasswords.map((password) => (
                    <Card key={password.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-semibold truncate max-w-[150px]" title={password.title}>
                                    {password.title}
                                </CardTitle>
                                <CardDescription className="text-xs truncate max-w-[180px]">
                                    {password.username || 'No username'}
                                </CardDescription>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => onEdit(password)}>
                                        <Edit className="nr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => toggleReveal(password.id)}>
                                        {revealedIds.has(password.id) ? (
                                            <><EyeOff className="mr-2 h-4 w-4" /> Hide Password</>
                                        ) : (
                                            <><Eye className="mr-2 h-4 w-4" /> Show Password</>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onClick={() => onDelete(password)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-2">
                            <div className="flex justify-between items-center">
                                <CategoryBadge category={password.category} />
                                {password.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                            </div>

                            <div className="group relative bg-muted/50 p-2 rounded flex items-center justify-between">
                                <div className="font-mono text-sm truncate mr-8">
                                    {revealedIds.has(password.id) ? (
                                        password.password || <span className="text-muted-foreground italic">empty</span>
                                    ) : (
                                        '••••••••••••'
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => copyToClipboard(password.password || '')}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>

                            {password.website && (
                                <a
                                    href={password.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
                                >
                                    <Globe className="h-3 w-3" /> {password.website}
                                </a>
                            )}
                        </CardContent>
                        <CardFooter className="pt-0 text-[10px] text-muted-foreground">
                            Updated {formatDistanceToNow(new Date(password.updatedAt))} ago
                        </CardFooter>
                    </Card>
                ))}
            </div>
            {filteredPasswords.length === 0 && search && (
                <div className="text-center text-muted-foreground mt-8">
                    No passwords match your search.
                </div>
            )}
        </div>
    );
}
