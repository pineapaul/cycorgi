"use client";
import React from "react";

// Types
export type RiskLevel = "Low" | "Moderate" | "High" | "Extreme";

export interface RiskMatrixProps {
  className?: string;
  likelihoodLabels?: [string, string, string, string, string];
  consequenceLabels?: [string, string, string, string, string];
  ratings?: RiskLevel[][];
  onSelect?: (args: {
    likelihoodIndex: number;
    consequenceIndex: number;
    likelihood: string;
    consequence: string;
    rating: RiskLevel;
  }) => void;
  onResidualRiskSelect?: (args: {
    likelihoodIndex: number;
    consequenceIndex: number;
    likelihood: string;
    consequence: string;
    rating: RiskLevel;
  }) => void;
  selected?: { likelihoodIndex: number; consequenceIndex: number } | null;
  ariaLabel?: string;
  currentRisk?: {
    likelihoodRating: string;
    consequenceRating: string;
    rating: RiskLevel;
  } | null;
  residualRisk?: {
    residualLikelihood: string;
    residualConsequence: string;
    rating: RiskLevel;
  } | null;
  isEditing?: boolean;
  compact?: boolean;
}

const DEFAULT_LIKELIHOOD: [string, string, string, string, string] = [
  "Rare",
  "Unlikely",
  "Possible",
  "Likely",
  "Almost Certain",
];

const DEFAULT_CONSEQUENCE: [string, string, string, string, string] = [
  "Insignificant",
  "Minor",
  "Moderate",
  "Major",
  "Critical",
];

const DEFAULT_RATINGS: RiskLevel[][] = [
  ["Low", "Low", "Moderate", "High", "High"],
  ["Low", "Low", "Moderate", "High", "Extreme"],
  ["Low", "Moderate", "High", "Extreme", "Extreme"],
  ["Moderate", "Moderate", "High", "Extreme", "Extreme"],
  ["Moderate", "High", "Extreme", "Extreme", "Extreme"],
];

function badgeClass(level: RiskLevel) {
  switch (level) {
    case "Low":
      return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/50";
    case "Moderate":
      return "bg-amber-100 text-amber-800 ring-1 ring-amber-200/50";
    case "High":
      return "bg-orange-100 text-orange-800 ring-1 ring-orange-200/50";
    case "Extreme":
      return "bg-rose-100 text-rose-800 ring-1 ring-rose-200/50";
  }
}

function cellClass(
  level: RiskLevel, 
  isSelected: boolean, 
  isCurrentRisk: boolean, 
  isResidualRisk: boolean,
  isEditing: boolean
) {
  const base =
    "flex items-center justify-center rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 sm:focus-visible:ring-offset-2 focus-visible:ring-blue-500/60 relative overflow-hidden";
  
  const bg =
    level === "Low"
      ? "bg-gradient-to-br from-emerald-50 to-emerald-100/80 hover:from-emerald-100 hover:to-emerald-200/80 border border-emerald-200/50"
      : level === "Moderate"
      ? "bg-gradient-to-br from-amber-50 to-amber-100/80 hover:from-amber-100 hover:to-amber-200/80 border border-amber-200/50"
      : level === "High"
      ? "bg-gradient-to-br from-orange-50 to-orange-100/80 hover:from-orange-100 hover:to-orange-200/80 border border-orange-200/50"
      : "bg-gradient-to-br from-rose-50 to-rose-100/80 hover:from-rose-100 hover:to-rose-200/80 border border-rose-200/50";
  
  let interactive = "";
  if (isEditing) {
    interactive = "cursor-pointer hover:scale-105 hover:shadow-md hover:shadow-black/5";
  } else {
    interactive = "cursor-default";
  }
  
  let selected = "";
  if (isCurrentRisk) {
    const ringColor = 
      level === "Low" ? "ring-emerald-600 shadow-emerald-500/20" :
      level === "Moderate" ? "ring-amber-600 shadow-amber-500/20" :
      level === "High" ? "ring-orange-600 shadow-orange-500/20" :
      "ring-rose-600 shadow-rose-500/20";
    selected = `ring-2 ${ringColor} ring-offset-1 sm:ring-offset-2 scale-105 shadow-lg z-10`;
  } else if (isResidualRisk) {
    const ringColor = 
      level === "Low" ? "ring-emerald-600 shadow-emerald-500/20" :
      level === "Moderate" ? "ring-amber-600 shadow-amber-500/20" :
      level === "High" ? "ring-orange-600 shadow-orange-500/20" :
      "ring-rose-600 shadow-rose-500/20";
    selected = `ring-2 ${ringColor} ring-offset-1 sm:ring-offset-2 scale-105 shadow-lg z-10`;
  } else if (isSelected) {
    selected = "ring-2 ring-blue-600 ring-offset-1 sm:ring-offset-2 scale-105 shadow-lg shadow-blue-500/20 z-10";
  }
  
  return `${base} ${bg} ${interactive} ${selected}`;
}

// Helper function to find matrix coordinates from likelihood/consequence strings
function findMatrixCoordinates(
  likelihood: string,
  consequence: string,
  likelihoodLabels: [string, string, string, string, string],
  consequenceLabels: [string, string, string, string, string]
): { likelihoodIndex: number; consequenceIndex: number } | null {
  const likelihoodIndex = likelihoodLabels.findIndex(label => 
    label.toLowerCase() === likelihood.toLowerCase()
  );
  const consequenceIndex = consequenceLabels.findIndex(label => 
    label.toLowerCase() === consequence.toLowerCase()
  );
  
  if (likelihoodIndex === -1 || consequenceIndex === -1) {
    return null;
  }
  
  return { likelihoodIndex, consequenceIndex };
}

export default function RiskMatrix({
  className,
  likelihoodLabels = DEFAULT_LIKELIHOOD,
  consequenceLabels = DEFAULT_CONSEQUENCE,
  ratings = DEFAULT_RATINGS,
  onSelect,
  onResidualRiskSelect,
  selected = null,
  ariaLabel = "Risk rating matrix combining likelihood and consequence",
  currentRisk = null,
  residualRisk = null,
  isEditing = false,
  compact = false,
}: RiskMatrixProps) {
  const [active, setActive] = React.useState<{ l: number; c: number } | null>(
    selected
      ? { l: selected.likelihoodIndex, c: selected.consequenceIndex }
      : null
  );
  const [editMode, setEditMode] = React.useState<'current' | 'residual'>('current');
  


  React.useEffect(() => {
    if (selected) setActive({ l: selected.likelihoodIndex, c: selected.consequenceIndex });
  }, [selected?.likelihoodIndex, selected?.consequenceIndex]);

  const currentRiskCoords = currentRisk 
    ? findMatrixCoordinates(currentRisk.likelihoodRating, currentRisk.consequenceRating, likelihoodLabels, consequenceLabels)
    : null;
  
  const residualRiskCoords = residualRisk 
    ? findMatrixCoordinates(residualRisk.residualLikelihood, residualRisk.residualConsequence, likelihoodLabels, consequenceLabels)
    : null;

  const handleSelect = (lIndex: number, cIndex: number) => {
    if (!isEditing) return;
    
    const rating = ratings[lIndex][cIndex];
    const payload = {
      likelihoodIndex: lIndex,
      consequenceIndex: cIndex,
      likelihood: likelihoodLabels[lIndex],
      consequence: consequenceLabels[cIndex],
      rating,
    } as const;
    
    setActive({ l: lIndex, c: cIndex });
    
    // Call the appropriate handler based on edit mode
    if (editMode === 'current') {
      onSelect?.(payload);
    } else {
      onResidualRiskSelect?.(payload);
    }
  };

  const gridRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = gridRef.current;
    if (!el || !isEditing) return;
    
    const onKey = (e: KeyboardEvent) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.preventDefault();
      setActive((prev) => {
        const cur = prev ?? { l: 0, c: 0 };
        let { l, c } = cur;
        if (e.key === "ArrowUp") l = Math.max(0, l - 1);
        if (e.key === "ArrowDown") l = Math.min(4, l + 1);
        if (e.key === "ArrowLeft") c = Math.max(0, c - 1);
        if (e.key === "ArrowRight") c = Math.min(4, c + 1);
        const next = { l, c };
        onSelect?.({
          likelihoodIndex: l,
          consequenceIndex: c,
          likelihood: likelihoodLabels[l],
          consequence: consequenceLabels[c],
          rating: ratings[l][c],
        });
        return next;
      });
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [onSelect, ratings, likelihoodLabels, consequenceLabels, isEditing]);

  return (
    <section
      className={
        `w-full ${compact ? 'max-w-4xl' : 'max-w-5xl'} mx-auto ` +
        (className ?? "")
      }
      aria-label={ariaLabel}
    >
      

             {(currentRisk || residualRisk) && (
         <div className={`${
           compact ? 'mb-3 gap-2' : 'mb-4 gap-3'
         } flex flex-wrap justify-center`}>
           {currentRisk && (
             <div className={`inline-flex items-center ${
               compact ? 'gap-1.5 rounded-lg px-2.5 py-1.5 shadow-sm' : 'gap-2 rounded-xl px-3 py-2 shadow-md'
             } ring-1 ring-offset-1 ${
               currentRisk.rating === "Low" ? "bg-emerald-100 text-emerald-800 ring-emerald-300" :
               currentRisk.rating === "Moderate" ? "bg-amber-100 text-amber-800 ring-amber-300" :
               currentRisk.rating === "High" ? "bg-orange-100 text-orange-800 ring-orange-300" :
               "bg-rose-100 text-rose-800 ring-rose-300"
             }`}>
               <div className={`${
                 compact ? 'w-2 h-2' : 'w-2.5 h-2.5'
               } rounded-full ${
                 currentRisk.rating === "Low" ? "bg-emerald-500" :
                 currentRisk.rating === "Moderate" ? "bg-amber-500" :
                 currentRisk.rating === "High" ? "bg-orange-500" :
                 "bg-rose-500"
               }`}></div>
               <div className="text-center">
                 <div className={`${
                   compact ? 'text-xs' : 'text-xs'
                 } font-bold`}>Current Risk: {currentRisk.rating}</div>
                 <div className="text-xs opacity-75">
                   {currentRisk.likelihoodRating} × {currentRisk.consequenceRating}
                 </div>
               </div>
             </div>
           )}
           {residualRisk && (
             <div className={`inline-flex items-center ${
               compact ? 'gap-1.5 rounded-lg px-2.5 py-1.5 shadow-sm' : 'gap-2 rounded-xl px-3 py-2 shadow-md'
             } ring-1 ring-offset-1 ${
               residualRisk.rating === "Low" ? "bg-emerald-100 text-emerald-800 ring-emerald-300" :
               residualRisk.rating === "Moderate" ? "bg-amber-100 text-amber-800 ring-amber-300" :
               residualRisk.rating === "High" ? "bg-orange-100 text-orange-800 ring-orange-300" :
               "bg-rose-100 text-rose-800 ring-rose-300"
             }`}>
               <div className={`${
                 compact ? 'w-2 h-2' : 'w-2.5 h-2.5'
               } rounded-full ${
                 residualRisk.rating === "Low" ? "bg-emerald-500" :
                 residualRisk.rating === "Moderate" ? "bg-amber-500" :
                 residualRisk.rating === "High" ? "bg-orange-500" :
                 "bg-rose-500"
               }`}></div>
               <div className="text-center">
                 <div className={`${
                   compact ? 'text-xs' : 'text-xs'
                 } font-bold`}>Residual Risk: {residualRisk.rating}</div>
                 <div className="text-xs opacity-75">
                   {residualRisk.residualLikelihood} × {residualRisk.residualConsequence}
                 </div>
               </div>
             </div>
           )}
         </div>
       )}

       {/* Edit Mode Selector */}
       {isEditing && (
         <div className={`${
           compact ? 'mb-3' : 'mb-4'
         } flex justify-center`}>
           <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
             <button
               onClick={() => setEditMode('current')}
               className={`${
                 editMode === 'current'
                   ? 'bg-purple-600 text-white shadow-sm'
                   : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
               } ${
                 compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
               } rounded-md font-medium transition-all duration-200`}
             >
               Edit Current Risk
             </button>
             <button
               onClick={() => setEditMode('residual')}
               className={`${
                 editMode === 'residual'
                   ? 'bg-purple-600 text-white shadow-sm'
                   : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
               } ${
                 compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
               } rounded-md font-medium transition-all duration-200`}
             >
               Edit Residual Risk
             </button>
           </div>
         </div>
       )}

       {/* Active Edit Mode Indicator */}
       {isEditing && (
         <div className={`${
           compact ? 'mb-3' : 'mb-4'
         } flex justify-center`}>
           <div className={`inline-flex items-center ${
             compact ? 'gap-2 px-3 py-1.5' : 'gap-2 px-4 py-2'
           } rounded-lg ${
             editMode === 'current' 
               ? 'bg-purple-100 text-purple-800 border border-purple-200' 
               : 'bg-rose-100 text-rose-800 border border-rose-200'
           }`}>
             <div className={`${
               compact ? 'w-2 h-2' : 'w-3 h-3'
             } rounded-full ${
               editMode === 'current' ? 'bg-purple-500' : 'bg-rose-500'
             }`}></div>
             <span className={`${
               compact ? 'text-xs' : 'text-sm'
             } font-medium`}>
               {editMode === 'current' ? 'Editing Current Risk' : 'Editing Residual Risk'}
             </span>
           </div>
         </div>
       )}

      {isEditing && active && (
        <div className={`${
          compact ? 'mb-3' : 'mb-4'
        } flex justify-center`}>
          <div className={`inline-flex items-center ${
            compact ? 'gap-1.5 rounded-lg px-3 py-1.5 shadow-sm' : 'gap-2 rounded-xl px-4 py-2 shadow-md'
          } ${badgeClass(ratings[active.l][active.c])}`}>
            <div className="text-center">
              <div className={`${
                compact ? 'text-xs' : 'text-sm'
              } font-bold`}>{ratings[active.l][active.c]} Risk</div>
              <div className="text-xs opacity-75">
                {likelihoodLabels[active.l]} × {consequenceLabels[active.c]}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`relative bg-white rounded-xl shadow-lg border border-gray-200 ${
        compact ? 'px-2 py-4' : 'px-3 sm:px-4 py-6 sm:py-8'
      }`}>
        <div className={`grid grid-cols-6 mx-auto max-w-fit ${
          compact ? 'gap-1 sm:gap-2' : 'gap-2 sm:gap-3'
        }`} ref={gridRef} tabIndex={isEditing ? 0 : -1} role="grid" aria-readonly={!isEditing}>
          <div className="flex items-center justify-center">
            <div className={`${
              compact ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-6 h-6 sm:w-7 sm:h-7'
            } bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center`}>
              <span className="text-xs font-bold text-gray-600">L/C</span>
            </div>
          </div>
          
          {consequenceLabels.map((label, cIdx) => (
            <div
              key={`c-head-${cIdx}`}
              role="columnheader"
              className="text-center"
            >
              <div className="text-center">
                <div className={`${
                  compact ? 'text-xs px-1' : 'text-xs sm:text-sm px-1 sm:px-2'
                } font-semibold text-gray-700 leading-tight`}>
                  {label}
                </div>
              </div>
            </div>
          ))}

          {likelihoodLabels.map((lLabel, lIdx) => (
            <React.Fragment key={`row-${lIdx}`}>
              <div className="flex flex-col items-center justify-center">
                <div className={`${
                  compact ? 'text-xs max-w-14 sm:max-w-16' : 'text-xs sm:text-sm max-w-16 sm:max-w-20'
                } font-semibold text-gray-700 text-center leading-tight`}>
                  {lLabel}
                </div>
              </div>

               {consequenceLabels.map((_, cIdx) => {
                 const rating = ratings[lIdx][cIdx];
                 const isSelected = !!active && active.l === lIdx && active.c === cIdx;
                 const isCurrentRisk = !!currentRiskCoords && currentRiskCoords.likelihoodIndex === lIdx && currentRiskCoords.consequenceIndex === cIdx;
                 const isResidualRisk = !!residualRiskCoords && residualRiskCoords.likelihoodIndex === lIdx && residualRiskCoords.consequenceIndex === cIdx;
                 
                 return (
                   <div key={`cell-${lIdx}-${cIdx}`} className="relative group">
                     <button
                       role="gridcell"
                       aria-label={`${rating} risk, ${lLabel} likelihood by ${consequenceLabels[cIdx]} consequence`}
                       className={`${cellClass(rating, isSelected, isCurrentRisk, isResidualRisk, isEditing)} ${
                         compact ? 'min-h-[2.5rem] sm:min-h-[3rem]' : 'min-h-[3rem] sm:min-h-[4rem]'
                       } w-full`}
                       onClick={() => handleSelect(lIdx, cIdx)}
                       disabled={!isEditing}
                     >
                       <span className="sr-only">{lLabel} × {consequenceLabels[cIdx]}</span>
                       <span className="font-bold text-gray-800 group-hover:text-gray-900 transition-colors text-xs sm:text-sm">
                         {rating}
                       </span>
                       
                     {isCurrentRisk && (
                       <div className={`absolute inset-0 rounded-xl ${
                         rating === "Low" ? "bg-emerald-500/20" :
                         rating === "Moderate" ? "bg-amber-500/20" :
                         rating === "High" ? "bg-orange-500/20" :
                         "bg-rose-500/20"
                       }`} />
                     )}
                     {isResidualRisk && !isCurrentRisk && (
                       <div className={`absolute inset-0 rounded-xl ${
                         rating === "Low" ? "bg-emerald-500/20" :
                         rating === "Moderate" ? "bg-amber-500/20" :
                         rating === "High" ? "bg-orange-500/20" :
                         "bg-rose-500/20"
                       }`} />
                     )}
                     {isSelected && !isCurrentRisk && !isResidualRisk && (
                       <div className="absolute inset-0 bg-blue-500/10 rounded-xl animate-pulse" />
                     )}
                     </button>
                     
                     <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                       <div className="text-center">
                         <div className="font-semibold">{rating} Risk</div>
                         <div className="text-xs opacity-75">
                           {lLabel} × {consequenceLabels[cIdx]}
                         </div>
                       </div>
                       <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                     </div>
                   </div>
                 );
               })}
            </React.Fragment>
          ))}
        </div>
      </div>


    </section>
  );
}