"use client"
import React from 'react';
import styled from "styled-components";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const TabStyled = styled.nav`
width: 100%;
    display: flex;
    align-items: center;
    height: 40px;
    border-radius: 24px;
    border: 1px solid #dddddd;
    overflow: hidden;
    .tab-item {
        all: unset;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #FFF;
        font-size: 18px;
        height: 100%;
        font-weight: 500;
        flex: 1 0 0;
        padding: 4px 12px;
      overflow: hidden;
        cursor: pointer;
        background: transparent;
        border: none;
        border-radius: 24px;
        span{
            white-space: nowrap;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;  
        }
    }
    .tab-item.active {
        background: #ffffff;
        color: #374e45;
    }
`;
export type TabItem = {
    name: string;
    path?: string;
    params?: string;
};

type TabsProps = {
    data: TabItem[];
    onChangeAction?: (tab: TabItem, index: number) => void;
    queryKey?: string;
};

export const Tabs = ({ data, onChangeAction, queryKey = "tab" }: TabsProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeParam = searchParams.get(queryKey);

    const handleClick = (tab: TabItem, index: number) => {
        const nextParams = new URLSearchParams(searchParams.toString());
        if (tab.params) {
            nextParams.set(queryKey, tab.params);
        } else {
            nextParams.delete(queryKey);
        }
        const nextQuery = nextParams.toString();
        const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
        router.push(nextUrl);
        onChangeAction?.(tab, index);
    };

    const activeIndex = data.findIndex((tab) => {
        if (tab.path === pathname || tab.params === activeParam) return true;
        return false;
    });

    const resolvedActiveIndex = activeIndex === -1 ? 0 : activeIndex;

    return (
        <TabStyled>
            {data.map((tab, index) => (
                <button
                    key={`${tab.name}-${index}`}
                    type="button"
                    className={`tab-item ${resolvedActiveIndex === index ? "active" : ""}`}
                    onClick={() => handleClick(tab, index)}
                >
                  <span>{tab.name}</span>
                </button>
            ))}
        </TabStyled>
    );
};
