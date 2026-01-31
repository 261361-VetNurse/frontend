'use client';

import React, { useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import {theme} from "@/styles/tokens/theme";

export type ProfileSize = number | string;

export interface ProfileProps {
    imageUrl?: string;
    alt?: string;

    /** Optional label under the avatar */
    label?: string;
    showLabel?: boolean;

    /** Avatar size (px number or CSS size string) */
    size?: ProfileSize;

    /** Shape of the avatar */
    shape?: 'circle' | 'rounded';

    /** Visual states */
    selected?: boolean;
    disabled?: boolean;
    loading?: boolean;

    /** Fallback when image is missing or fails */
    fallbackText?: string; // e.g., "Lee" -> "L"
    fallbackIcon?: React.ReactNode;

    /** Optional badge (dot, icon, etc.) displayed on avatar corner */
    badge?: React.ReactNode;
    notificationCount?: number;

    /** Interaction */
    onClick?: () => void;
    href?: string;

    /** Styling */
    className?: string;
    ariaLabel?: string;
}

const toCssSize = (v: ProfileSize | undefined, fallbackPx: number) => {
    if (v === undefined) return `${fallbackPx}px`;
    return typeof v === 'number' ? `${v}px` : v;
};

const getInitial = (label?: string, fallbackText?: string) => {
    const s = (fallbackText ?? label ?? '').trim();
    if (!s) return '?';
    // pick first letter/char; works for Thai too
    return s[0].toUpperCase?.() ?? s[0];
};

const Wrapper = styled.div<{
    $clickable: boolean;
    $disabled: boolean;
}>`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  ${({ $clickable, $disabled }) =>
    $clickable &&
    !$disabled &&
    css`
      cursor: pointer;
    `}

  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    `}
`;

const Clickable = styled.button<{ $reset: boolean }>`
  ${({ $reset }) =>
    $reset &&
    css`
      appearance: none;
      border: 0;
      padding: 0;
      margin: 0;
      background: transparent;
      font: inherit;
      color: inherit;
    `}

  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
`;

const AvatarBox = styled.div<{
    $size: string;
    $shape: 'circle' | 'rounded';
    $selected: boolean;
}>`
  position: relative;
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  overflow: hidden;

  border-radius: ${({ $shape }) => ($shape === 'circle' ? '9999px' : '12px')};

  ${({ $selected }) =>
    $selected &&
    css`
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.18);
    `}
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Fallback = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  user-select: none;
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.72);
  font-weight: 600;
`;

const Skeleton = styled.div`
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.08);
`;

const BadgeSlot = styled.div`
  position: absolute;
  right: -2px;
  bottom: -2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const CountBadge = styled.div`
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.82);
  color: #fff;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
`;

const Label = styled.div`
  font-size: 14px;
  line-height: 18px;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${theme.colors.textSecondary} ;
`;

export default function Profile({
                                    imageUrl,
                                    alt,
                                    label,
                                    showLabel,
                                    size,
                                    shape = 'circle',
                                    selected = false,
                                    disabled = false,
                                    loading = false,
                                    fallbackText,
                                    fallbackIcon,
                                    badge,
                                    notificationCount,
                                    onClick,
                                    href,
                                    className,
                                    ariaLabel,
                                }: ProfileProps) {
    const [imgError, setImgError] = useState(false);

    const clickable = Boolean(onClick || href);
    const show = showLabel ?? Boolean(label);

    const computedAlt = alt ?? label ?? ariaLabel ?? 'profile';
    const initial = useMemo(() => getInitial(label, fallbackText), [label, fallbackText]);

    const cssSize = toCssSize(size, 56);

    const content = (
        <AvatarBox $size={cssSize} $shape={shape} $selected={selected}>
            {loading ? (
                <Skeleton aria-hidden="true" />
            ) : imageUrl && !imgError ? (
                <AvatarImage
                    src={imageUrl}
                    alt={computedAlt}
                    onError={() => setImgError(true)}
                    draggable={false}
                />
            ) : (
                <Fallback aria-label={computedAlt}>
                    {fallbackIcon ?? <span>{initial}</span>}
                </Fallback>
            )}

            {(badge || (typeof notificationCount === 'number' && notificationCount > 0)) && (
                <BadgeSlot>
                    {badge ??
                        (typeof notificationCount === 'number' && notificationCount > 0 ? (
                            <CountBadge>{notificationCount > 99 ? '99+' : notificationCount}</CountBadge>
                        ) : null)}
                </BadgeSlot>
            )}
        </AvatarBox>
    );

    const interactiveProps = {
        'aria-label': ariaLabel ?? label ?? computedAlt,
        onClick: onClick,
    };

    return (
        <Wrapper className={className} $clickable={clickable} $disabled={disabled}>
            {href ? (
                <a href={href} aria-label={interactiveProps['aria-label']}>
                    {content}
                </a>
            ) : clickable ? (
                <Clickable type="button" $reset={true} {...interactiveProps}>
                    {content}
                </Clickable>
            ) : (
                content
            )}

            {show && label ? <Label title={label}>{label}</Label> : null}
        </Wrapper>
    );
}
