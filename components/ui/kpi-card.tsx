'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { KPI } from '@/types';

interface KPICardProps {
  kpi: KPI;
  className?: string;
}

export function KPICard({ kpi, className }: KPICardProps) {
  const Icon = kpi.changeType === 'increase' ? TrendingUp : TrendingDown;
  
  return (
    <Card className={cn('transition-colors hover:bg-muted/50', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </p>
            <p className="text-3xl font-bold">
              {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
            </p>
            <div className="flex items-center space-x-1 text-sm">
              <Icon 
                className={cn(
                  'h-4 w-4',
                  kpi.changeType === 'increase' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                )} 
              />
              <span className={cn(
                'font-medium',
                kpi.changeType === 'increase' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              )}>
                {Math.abs(kpi.change)}%
              </span>
              <span className="text-muted-foreground">
                vs last month
              </span>
            </div>
          </div>
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            kpi.color
          )}>
            <div className="text-2xl">{kpi.icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}