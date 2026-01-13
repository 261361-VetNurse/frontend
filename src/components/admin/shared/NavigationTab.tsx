'use client';

import React from 'react';
import styled from 'styled-components';

type TabsStyle = 'underline' | 'pill';
type TabsSize = 'sm' | 'md';
type Orientation = 'horizontal' | 'vertical';

export type TabItem = {
    key: string;
    label: string;
    count?: number;
    disabled?: boolean;
};

export type TabsProps = {
    items: TabItem[];
    value: string;
    onChange: (key: string) => void;

    style?: TabsStyle;
    size?: TabsSize;
    orientation?: Orientation;
    className?: string;
};

/* ---------------- styled ---------------- */

const TabsRoot = styled.div<{ $orientation: Orientation }>`
  display: flex;
  flex-direction: ${({ $orientation }) => ($orientation === 'vertical' ? 'row' : 'column')};
  gap: ${({ $orientation }) => ($orientation === 'vertical' ? '12px' : '10px')};
`;

const TabList = styled.div<{ $orientation: Orientation; $style: TabsStyle }>`
  display: flex;
  flex-direction: ${({ $orientation }) => ($orientation === 'vertical' ? 'column' : 'row')};
  align-items: ${({ $orientation }) => ($orientation === 'vertical' ? 'stretch' : 'center')};
  gap: 8px;

  ${({ $style, $orientation }) =>
        $style === 'underline' &&
        $orientation === 'horizontal' &&
        `
      border-bottom: 1px solid #e6e6e6;
      padding-bottom: 6px;
    `}

  ${({ $style, $orientation }) =>
        $style === 'pill' &&
        $orientation === 'horizontal' &&
        `
      border: 1px solid #e6e6e6;
      border-radius: 12px;
      padding: 6px;
      width: fit-content;
      background: #fff;
    `}
`;

const TabButton = styled.button<{
    $active: boolean;
    $style: TabsStyle;
    $size: TabsSize;
    $orientation: Orientation;
}>`
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: ${({ $orientation }) => ($orientation === 'vertical' ? 'space-between' : 'center')};
  gap: 10px;

  font-weight: 600;
  color: ${({ $active }) => ($active ? '#111' : '#777')};

  padding: ${({ $size }) => ($size === 'sm' ? '8px 10px' : '10px 12px')};
  font-size: ${({ $size }) => ($size === 'sm' ? '13px' : '14px')};
  border-radius: ${({ $style }) => ($style === 'pill' ? '10px' : '10px')};

  width: ${({ $orientation }) => ($orientation === 'vertical' ? '220px' : 'auto')};

  /* hover */
  &:hover {
    color: #111;
    background: ${({ $style }) => ($style === 'pill' ? 'rgba(0,0,0,0.04)' : 'transparent')};
  }

  /* pressed */
  &:active {
    transform: translateY(1px);
  }

  /* disabled */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  /* underline style active indicator */
  ${({ $style, $active, $orientation }) =>
        $style === 'underline' &&
        $orientation === 'horizontal' &&
        `
      position: relative;

      &::after{
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -7px;
        height: 2px;
        border-radius: 2px;
        background: ${$active ? '#111' : 'transparent'};
        transition: background 0.15s ease;
      }
    `}

  /* underline + vertical: ใช้ขีดด้านซ้าย */
  ${({ $style, $active, $orientation }) =>
        $style === 'underline' &&
        $orientation === 'vertical' &&
        `
      position: relative;
      border-radius: 10px;
      background: ${$active ? 'rgba(0,0,0,0.04)' : 'transparent'};

      &::before{
        content: '';
        position: absolute;
        left: 0;
        top: 6px;
        bottom: 6px;
        width: 3px;
        border-radius: 3px;
        background: ${$active ? '#111' : 'transparent'};
      }
      padding-left: 14px;
    `}

  /* pill active */
  ${({ $style, $active }) =>
        $style === 'pill' &&
        `
      background: ${$active ? '#111' : 'transparent'};
      color: ${$active ? '#fff' : '#777'};
      &:hover { background: ${$active ? '#111' : 'rgba(0,0,0,0.04)'}; }
    `}
`;

const Badge = styled.span<{ $active: boolean; $style: TabsStyle; $size: TabsSize }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: ${({ $size }) => ($size === 'sm' ? '20px' : '22px')};
  height: ${({ $size }) => ($size === 'sm' ? '20px' : '22px')};
  padding: 0 6px;

  font-size: ${({ $size }) => ($size === 'sm' ? '12px' : '12px')};
  font-weight: 700;
  border-radius: 999px;

  /* โทน badge ให้คล้ายภาพ */
  background: ${({ $active, $style }) =>
        $style === 'pill'
            ? $active
                ? 'rgba(255,255,255,0.18)'
                : '#f3f3f3'
            : '#f3f3f3'};

  color: ${({ $active, $style }) =>
        $style === 'pill' ? ($active ? '#fff' : '#666') : '#666'};
`;

const Panel = styled.div`
  font-size: 14px;
  color: #333;
`;

/* ---------------- component ---------------- */

export default function NavigationTab({
    items,
    value,
    onChange,
    style = 'underline',
    size = 'md',
    orientation = 'horizontal',
    className,
}: TabsProps) {
    return (
        <TabsRoot className={className} $orientation={orientation}>
            <TabList $orientation={orientation} $style={style} role="tablist" aria-orientation={orientation}>
                {items.map((t) => {
                    const active = t.key === value;
                    return (
                        <TabButton
                            key={t.key}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            aria-current={active ? 'page' : undefined}
                            $active={active}
                            $style={style}
                            $size={size}
                            $orientation={orientation}
                            disabled={t.disabled}
                            onClick={() => !t.disabled && onChange(t.key)}
                        >
                            <span>{t.label}</span>
                            {typeof t.count === 'number' && (
                                <Badge $active={active} $style={style} $size={size}>
                                    {t.count}
                                </Badge>
                            )}
                        </TabButton>
                    );
                })}
            </TabList>

            {/* optional panel placeholder */}
            <Panel role="tabpanel" aria-label="Tabs content">
                ใส่อะไรดีน้าาา
            </Panel>
        </TabsRoot>
    );
}
