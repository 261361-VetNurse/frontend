// "use client";

// import { useEffect, useRef, useState } from "react";
// import styled from "styled-components";

// const BoxWrap = styled.div`
//     display: flex;
//     width: 100%;
//     position: relative;
//     flex-direction: column;

//     .ListBox{
//         display: flex;
//         padding: 12px 20px;
//         justify-content: space-between;
//         align-items: center;
//         align-self: stretch;
//         border-radius: 16px;
//         background: #FFF;
//         //box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.2);
//         border: none;
//         width: 100%;
//         height: 66px;
//         cursor: pointer;
//         gap: 16px;
//     }

//     .ListBoxContent{
//         display: flex;
//         align-items: center;
//         gap: 16px;
//         flex: 1;
//     }

//     .ListBoxTextGroup{
//         display: flex;
//         flex-direction: column;
//         gap: 2px;
//         align-items: flex-start;
//         text-align: left;
//     }

//     .ListBoxIcon{
//         width: 50px;
//         height: 50px;
//         border-radius: 50%;
//         background: #B9B9B9;
//         display: grid;
//         place-items: center;
//         flex: 0 0 auto;
//         overflow: hidden;
//     }

//     .ListBoxText{
//         color: #000;
//         font-size: 18px;
//         font-weight: 400;
//     }

//     .ListBoxSubText{
//         color: #000;
//         font-size: 12px;
//         font-weight: 275;
//     }

//     .ListBoxChevron{
//         width: 18px;
//         height: 18px;
//         transition: transform 0.2s ease;
//     }

//     .ListBoxChevron.is-open{
//         transform: rotate(180deg);
//     }

//     .ListBoxMenu{
//         position: absolute;
//         top: calc(100% + 8px);
//         left: 0;
//         width: 100%;
//         background: #FFF;
//         border-radius: 16px;
//         border: 1px solid rgba(0, 0, 0, 0.08);
//         box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.12);
//         z-index: 20;
//         overflow: hidden;
//     }

//     .ListBoxOption{
//         display: flex;
//         align-items: center;
//         gap: 12px;
//         padding: 12px 20px;
//         width: 100%;
//         border: none;
//         background: #FFF;
//         text-align: left;
//         cursor: pointer;
//     }

//     .ListBoxOption + .ListBoxOption{
//         border-top: 1px solid rgba(0, 0, 0, 0.08);
//     }

//     .ListBoxOption:hover{
//         background: #F7F7F7;
//     }

//     .ListBoxOptionIcon{
//         width: 36px;
//         height: 36px;
//         border-radius: 50%;
//         background: #B9B9B9;
//         display: grid;
//         place-items: center;
//         overflow: hidden;
//         flex: 0 0 auto;
//     }

//     .ListBoxOptionText{
//         font-size: 16px;
//         font-weight: 400;
//         color: #000;
//     }

//     .row{
//         display: flex;
//         gap: 16px;
//         align-items: center;
//     }

//     .name{
//         font-size: 16px;
//         font-weight: 400;
//     }

//     .sub{
//         font-size: 12px;
//         color: #000;
//         font-weight: 275;
//     }
// `;

// type PetOption = {
//     id: string;
//     name: string;
//     image?: string;
//     pid?: string;
// };

// type PetListProps = {
//     pets?: PetOption[];
//     selectedPetId?: string;
//     onSelectPet?: (petId: string) => void;
// };

// export default function PetList({
//     pets = [],
//     selectedPetId = "all",
//     onSelectPet,
// }: PetListProps) {
//     const [isOpen, setIsOpen] = useState(false);
//     const wrapperRef = useRef<HTMLDivElement | null>(null);

//     useEffect(() => {
//         if (!isOpen) {
//             return;
//         }
//         const handleClickOutside = (event: MouseEvent) => {
//             if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
//                 setIsOpen(false);
//             }
//         };
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, [isOpen]);

//     const selectedPet = selectedPetId === "all"
//         ? null
//         : pets.find((pet) => pet.id === selectedPetId);
//     const selectedLabel = selectedPet ? selectedPet.name : "All Pets";
//     const selectedPid = selectedPet?.pid;
//     const selectedImage = selectedPet?.image;
//     const defaultPetImage = "/pets-example/pet-ex1.svg";

//     const handleSelect = (petId: string) => {
//         onSelectPet?.(petId);
//         setIsOpen(false);
//     };

//     return(
//         <BoxWrap ref={wrapperRef}>
//             <button
//                 className="ListBox"
//                 type="button"
//                 aria-label="Select pet filter"
//                 aria-expanded={isOpen}
//                 aria-haspopup="listbox"
//                 onClick={() => setIsOpen((prev) => !prev)}
//             >
//                 <div className="ListBoxContent">
//                     <div className="ListBoxIcon" aria-hidden="true">
//                         {selectedPet ? (
//                             <img
//                                 src={selectedImage || defaultPetImage}
//                                 alt={selectedLabel}
//                                 className="h-full w-full object-cover"
//                             />
//                         ) : (
//                             <img src="/pet-paw.svg" alt="" className="h-[30px] w-[30px]" />
//                         )}
//                     </div>
//                     <div className="ListBoxTextGroup">
//                         <span className="ListBoxText">{selectedLabel}</span>
//                         {selectedPet ? (
//                             <span className="ListBoxSubText">
//                                 PID: {selectedPid ?? "-"}
//                             </span>
//                         ) : null}
//                     </div>
//                 </div>
//                 <img
//                     src="/down-icon.svg"
//                     alt=""
//                     className={`ListBoxChevron${isOpen ? " is-open" : ""}`}
//                 />
//             </button>
//             {isOpen ? (
//                 <div className="ListBoxMenu" role="listbox">
//                     <button
//                         className="ListBoxOption"
//                         type="button"
//                         onClick={() => handleSelect("all")}
//                         role="option"
//                         aria-selected={selectedPetId === "all"}
//                     >
//                         <div className="ListBoxOptionIcon" aria-hidden="true">
//                             <img src="/pet-paw.svg" alt="" className="h-[20px] w-[20px]" />
//                         </div>
//                         <span className="ListBoxOptionText">All Pets</span>
//                     </button>
//                     {pets.map((pet) => (
//                         <button
//                             key={pet.id}
//                             className="ListBoxOption"
//                             type="button"
//                             onClick={() => handleSelect(pet.id)}
//                             role="option"
//                             aria-selected={selectedPetId === pet.id}
//                         >
//                             <div className="ListBoxOptionIcon" aria-hidden="true">
//                                 <img
//                                     src={pet.image || defaultPetImage}
//                                     alt=""
//                                     className="h-full w-full object-cover"
//                                 />
//                             </div>
//                             <span className="ListBoxOptionText">{pet.name}</span>
//                         </button>
//                     ))}
//                 </div>
//             ) : null}
//         </BoxWrap>
//     );
// }
