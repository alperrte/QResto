import type { Dispatch, SetStateAction } from "react";
import DetailOptionRow from "./DetailOptionRow";

export type MenuDetailExtrasState = {
    onion: boolean;
    mushroom: boolean;
    parmesan: boolean;
};

type MenuDetailExtrasSectionProps = {
    extras: MenuDetailExtrasState;
    setExtras: Dispatch<SetStateAction<MenuDetailExtrasState>>;
    animationDelayMs?: string;
};

const MenuDetailExtrasSection = ({
    extras,
    setExtras,
    animationDelayMs = "360ms",
}: MenuDetailExtrasSectionProps) => {
    return (
        <section
            className="flex flex-col gap-stack-sm menu-detail-fade-up"
            style={{ animationDelay: animationDelayMs }}
        >
            <h2 className="font-headline text-headline-md text-on-surface">Ekstra Lezzetler</h2>
            <div className="flex flex-col gap-3">
                <DetailOptionRow
                    className="p-3 rounded-xl hover:bg-surface-container-low"
                    left={
                        <>
                            <input
                                type="checkbox"
                                checked={extras.onion}
                                onChange={(e) =>
                                    setExtras((prev) => ({ ...prev, onion: e.target.checked }))
                                }
                                className="w-5 h-5 rounded accent-primary"
                            />
                            <span className="text-body-lg text-on-surface">Karamelize Soğan</span>
                        </>
                    }
                    trailing={<span className="text-body-sm text-on-surface-variant">+ ₺25</span>}
                />
                <DetailOptionRow
                    className="p-3 rounded-xl hover:bg-surface-container-low"
                    left={
                        <>
                            <input
                                type="checkbox"
                                checked={extras.mushroom}
                                onChange={(e) =>
                                    setExtras((prev) => ({ ...prev, mushroom: e.target.checked }))
                                }
                                className="w-5 h-5 rounded accent-primary"
                            />
                            <span className="text-body-lg text-on-surface">Mantar Sote</span>
                        </>
                    }
                    trailing={<span className="text-body-sm text-on-surface-variant">+ ₺40</span>}
                />
                <DetailOptionRow
                    className="p-3 rounded-xl hover:bg-surface-container-low"
                    left={
                        <>
                            <input
                                type="checkbox"
                                checked={extras.parmesan}
                                onChange={(e) =>
                                    setExtras((prev) => ({ ...prev, parmesan: e.target.checked }))
                                }
                                className="w-5 h-5 rounded accent-primary"
                            />
                            <span className="text-body-lg text-on-surface">Ekstra Parmesan</span>
                        </>
                    }
                    trailing={<span className="text-body-sm text-on-surface-variant">+ ₺35</span>}
                />
            </div>
        </section>
    );
};

export default MenuDetailExtrasSection;
