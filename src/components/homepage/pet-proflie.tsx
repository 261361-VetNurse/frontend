import styled from "styled-components";

const Proflie = styled.div<{ $size: number, $color: string }>`
    width: ${({ $size }) => $size}px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .avatar{
        width: ${({ $size }) => $size}px;
        height: ${({ $size }) => $size}px;
        border-radius: ${({ $size }) => $size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid ${({$color}) => $color};
    }
    .icon{
        width: ${({ $size }) => Math.max($size - 5, 1)}px;
        height: ${({ $size }) => Math.max($size - 5, 1)}px;
    }
    .name{
        color: #000;
        text-align: center;
        font-size: 13px;
        font-weight: 400;
    }
`;

type ProfileProps = {
    name?: string;
    showName?: boolean;
    className?: string;
    size?: number;
};

export default function ProflieCom({ name = "name", showName = true, className, size = 60 }: ProfileProps) {
    return(
        <Proflie className={className} $size={size} $color={"#FFB1E2"}>
            <div className="avatar">
                <img className="icon" src="/pet-ex1.svg" alt="pet-ex1" />
            </div>
            {showName && <div className="name">{name}</div>}
        </Proflie>
    )
}
