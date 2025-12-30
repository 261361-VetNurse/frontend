import styled from "styled-components";
import { theme } from "@/styles/theme";
import AddIcon from '@mui/icons-material/Add';

const Proflie = styled.div<{ $size: number, $color: string }>`
    width: ${({ $size }) => $size}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    
    &:active {
        filter: grayscale(50%);
    }

    .avatar{
        width: ${({ $size }) => $size}px;
        height: ${({ $size }) => $size}px;
        border-radius: ${({ $size }) => $size}px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .icon{
        width: ${({ $size }) => $size}px;
        height: ${({ $size }) => $size}px;
        border-radius: 50%;
        background-color: ${theme.colors.primary};
        display: flex;
        align-items: center;
        justify-content: center;
        &:active {
            filter: grayscale(70%);
        }

        img{
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        svg{
            width: 70%;
            height: 70%;
        }
    }
    .name{
        color: #000;
        text-align: center;
        font-size: 13px;
        font-weight: 400;
    }
`;

type ProfileProps = {
    petName?: string;
    petImage?: string;
    showName?: boolean;
    className?: string;
    size?: number;
};

export default function PetProflie({ petName = "Pet Name", petImage, className, size = 60 ,showName = true}: ProfileProps) {
    return(
        <Proflie className={className} $size={size} $color={"#FFB1E2"}>
            <div className="avatar">
                {petImage ? 
                (<div className="icon">
                    <img src={petImage || "/pet-ex1.svg"} alt="pet" onError={(e) => { e.currentTarget.src = "/pet-ex1.svg"; }} />
                </div>) : 
                (<div className="icon">
                    <AddIcon />
                </div>)}
            </div>
            {showName && <div className="name">{petName}</div>}
        </Proflie>
    )
}
