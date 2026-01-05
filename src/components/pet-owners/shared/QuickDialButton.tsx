import React from "react";
import styled from "styled-components";

type Position =
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";

type ButtonProps = {
    $bgColor: string;
    $position: Position;
};

const positionStyles = (position: Position) => {
    switch (position) {
        case "top-left":
            return `
        top: 24px;
        left: 0;
      `;
        case "top-right":
            return `
        top: 24px;
        right: 0;
      `;
        case "bottom-left":
            return `
        bottom: 80px;
        left: 0;
      `;
        case "bottom-right":
        default:
            return `
        bottom: 80px;
        right: 0;
      `;
    }
};

const QuickDialButtonStyled = styled.button<ButtonProps>`
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: ${({ $bgColor }) => $bgColor};
  border: none;
  cursor: pointer;
  position: absolute;
  z-index: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  transition: transform 0.2s ease, filter 0.2s ease;

  ${({ $position }) => positionStyles($position)}

  &:hover {
    filter: brightness(90%);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

type Props = {
    icon: React.ReactNode;
    iconColor?: string;
    color?: string;
    position?: Position;
    onClickAction?: () => void;
};

export const QuickDialButton = ({
                                    icon,
                                    iconColor = "white",
                                    color = "#3b82f6",
                                    position = "bottom-right",
                                    onClickAction
                                }: Props) => {
    return (
        <QuickDialButtonStyled
            $bgColor={color}
            $position={position}
            aria-label="Quick dial button" onClick={onClickAction}
        >
      <span style={{ color: iconColor, display: "flex" }}>
        {icon}
      </span>
        </QuickDialButtonStyled>
    );
};
