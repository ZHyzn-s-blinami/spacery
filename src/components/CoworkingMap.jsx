import React, { useEffect, useRef, useState } from "react";

const CoworkingMap = ({ selectedSeat, onSeatSelect, freePlaces }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const mapRef = useRef(null);
    const [seats, setSeats] = useState([]);
    const [selectedZone, setSelectedZone] = useState(null);
    const [filtersExpanded, setFiltersExpanded] = useState(false);



    const generateSeats = () => {
        const rooms = [
            ...Array(30)
                .fill()
                .map((_, idx) => ({
                    id: `A${idx + 1}`,
                    name: `A${idx + 1}`,
                    x: 53 + (idx % 6) * 25,
                    y: 60 + Math.floor(idx / 6) * 25,
                    isOccupied: !freePlaces.some((item) => item.name === `A${idx + 1}`),
                    zone: 'A',
                    type: 'desk',
                })),
            ...Array(9)
                .fill()
                .map((_, idx) => ({
                    id: `B${idx + 1}`,
                    name: `B${idx + 1}`,
                    x: 280 + (idx % 3) * 50,
                    y: 65 + Math.floor(idx / 3) * 50,
                    isOccupied: !freePlaces.some((item) => item.name === `B${idx + 1}`),
                    zone: 'B',
                    type: 'office',
                })),
            ...Array(8)
                .fill()
                .map((_, idx) => ({
                    id: `C${idx + 1}`,
                    name: `C${idx + 1}`,
                    x: 55 + (idx % 4) * 40,
                    y: 280 + Math.floor(idx / 4) * 45,
                    isOccupied: !freePlaces.some((item) => item.name === `C${idx + 1}`),
                    zone: 'C',
                    type: 'meeting',
                })),
            ...Array(12)
                .fill()
                .map((_, idx) => ({
                    id: `D${idx + 1}`,
                    name: `D${idx + 1}`,
                    x: 265 + (idx % 6) * 27,
                    y: 285 + Math.floor(idx / 6) * 70,
                    isOccupied: !freePlaces.some((item) => item.name === `D${idx + 1}`),
                    zone: 'D',
                    type: 'focus',
                })),
            ...Array(6)
                .fill()
                .map((_, idx) => ({
                    id: `E${idx + 1}`,
                    name: `E${idx + 1}`,
                    x: 490 + (idx % 2) * 55,
                    y: 80 + Math.floor(idx / 2) * 40,
                    isOccupied: !freePlaces.some((item) => item.name === `E${idx + 1}`),
                    zone: 'E',
                    type: 'lounge',
                })),
        ];
        return rooms;
    };

    useEffect(() => {
        setSeats(generateSeats());
    }, [freePlaces]);

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale((prev) => Math.max(0.5, Math.min(2, prev + delta)));
    };

    const handleMouseDown = (e) => {
        let target = e.target;
        while (target && target !== mapRef.current) {
            if (target.getAttribute('data-seat') === 'true') {
                return;
            }
            target = target.parentElement;
        }

        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const currentMapRef = mapRef.current;
        if (currentMapRef) {
            currentMapRef.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (currentMapRef) {
                currentMapRef.removeEventListener('wheel', handleWheel);
            }
        };
    }, []);

    const moveToZone = (zone) => {
        setSelectedZone(zone);

        const zoneCoordinates = {
            A: { x: -40, y: -30, scale: 2.0 },
            B: { x: -260, y: -30, scale: 2.0 },
            C: { x: -40, y: -230, scale: 2.0 },
            D: { x: -260, y: -230, scale: 2.0 },
            E: { x: -460, y: -30, scale: 2.0 },
            coffee: { x: -460, y: -230, scale: 2.0 },
            all: { x: 0, y: 0, scale: 1 }
        };

        setScale(zoneCoordinates[zone].scale);
        setPosition({
            x: zoneCoordinates[zone].x,
            y: zoneCoordinates[zone].y
        });
    };

    const toggleFilters = () => {
        setFiltersExpanded(prev => !prev);
    };

    return (
        <div
            className="relative w-full overflow-hidden bg-gray-50 rounded-xl h-[500px] border border-gray-200 select-none"
            ref={mapRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
            }}
        >
            <div className="absolute top-3 left-3 bg-white p-2 rounded-md shadow-sm z-20">
                {/* Кнопки масштабирования */}
                <div className="flex gap-2 mb-2">
                    <button
                        className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center"
                        onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
                    >
                        +
                    </button>
                    <button
                        className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center"
                        onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
                    >
                        -
                    </button>
                    <button
                        className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center"
                        onClick={() => {
                            setScale(1);
                            setPosition({ x: 0, y: 0 });
                        }}
                    >
                        ↺
                    </button>
                    <button
                        className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center"
                        onClick={toggleFilters}
                    >
                        {filtersExpanded ? "↑" : "↓"}
                    </button>
                </div>

                {/* Кнопки фильтров с анимацией */}
                <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                        maxHeight: filtersExpanded ? '200px' : '0',
                        opacity: filtersExpanded ? 1 : 0,
                        marginTop: filtersExpanded ? '8px' : '0'
                    }}
                >
                    <div className="text-sm font-medium text-gray-700 mb-1">Перейти к зоне:</div>
                    <div className="grid grid-cols-2 gap-1">
                        <button
                            className={`px-2 py-1 text-xs rounded ${selectedZone === 'A' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}
                            onClick={() => moveToZone('A')}
                        >
                            Опен-спейс
                        </button>
                        <button
                            className={`px-2 py-1 text-xs rounded ${selectedZone === 'B' ? 'bg-teal-500 text-white' : 'bg-teal-100 text-teal-800'}`}
                            onClick={() => moveToZone('B')}
                        >
                            Кабинеты
                        </button>
                        <button
                            className={`px-2 py-1 text-xs rounded ${selectedZone === 'C' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800'}`}
                            onClick={() => moveToZone('C')}
                        >
                            Переговорные
                        </button>
                        <button
                            className={`px-2 py-1 text-xs rounded ${selectedZone === 'D' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-800'}`}
                            onClick={() => moveToZone('D')}
                        >
                            Тихая зона
                        </button>
                        <button
                            className={`px-2 py-1 text-xs rounded ${selectedZone === 'E' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'}`}
                            onClick={() => moveToZone('E')}
                        >
                            Зона отдыха
                        </button>
                        <button
                            className={`px-2 py-1 text-xs rounded ${selectedZone === 'coffee' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-800'}`}
                            onClick={() => moveToZone('coffee')}
                        >
                            Кофе-зона
                        </button>
                        <button
                            className={`px-2 py-1 text-xs rounded-full col-span-2 ${selectedZone === 'all' ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                            onClick={() => moveToZone('all')}
                        >
                            Показать всё
                        </button>
                    </div>
                </div>
            </div>

            <div
                style={{
                    transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                    transformOrigin: '0 0',
                    transition: isDragging ? 'none' : 'transform 0.2s',
                }}
                className="absolute inset-0"
            >
                <svg width="600" height="500" viewBox="0 0 600 400" className="mx-auto" style={{ pointerEvents: 'none' }}>
                    {/* Фон */}
                    <rect
                        x="10"
                        y="10"
                        width="580"
                        height="375"
                        rx="10"
                        fill="#f8fafc"
                        stroke="#94a3b8"
                        strokeWidth="2"
                    />

                    {/* фон коридоров */}
                    <rect x="20" y="20" width="360" height="375" rx="10" fill="#f8fafc" stroke="none" />

                    {/* Вертикальный коридор слева */}
                    <rect
                        x="215"
                        y="20"
                        width="10"
                        height="360"
                        fill="#e5e7eb"
                        stroke="#d1d5db"
                        strokeWidth="1"
                    />
                    <line x1="215" y1="20" x2="215" y2="380" stroke="#d1d5db" strokeWidth="1.5" />
                    <line x1="225" y1="20" x2="225" y2="380" stroke="#d1d5db" strokeWidth="1.5" />

                    {/* Вертикальный коридор справа */}
                    <rect
                        x="435"
                        y="20"
                        width="10"
                        height="360"
                        fill="#e5e7eb"
                        stroke="#d1d5db"
                        strokeWidth="1"
                    />
                    <line x1="435" y1="20" x2="435" y2="380" stroke="#d1d5db" strokeWidth="1.5" />
                    <line x1="445" y1="20" x2="445" y2="380" stroke="#d1d5db" strokeWidth="1.5" />

                    {/* Горизонтальный коридор */}
                    <rect
                        x="20"
                        y="205"
                        width="560"
                        height="10"
                        fill="#e5e7eb"
                        stroke="#d1d5db"
                        strokeWidth="1"
                    />
                    <line x1="20" y1="205" x2="560" y2="205" stroke="#d1d5db" strokeWidth="1.5" />
                    <line x1="20" y1="215" x2="560" y2="215" stroke="#d1d5db" strokeWidth="1.5" />

                    {Array.from({ length: 10 }).map((_, i) => (
                        <line
                            key={`vl-left-${i}`}
                            x1="220"
                            y1={40 + i * 36}
                            x2="220"
                            y2={40 + i * 36 + 20}
                            stroke="#d1d5db"
                            strokeWidth="0.75"
                            strokeDasharray="2,2"
                        />
                    ))}
                    {Array.from({ length: 10 }).map((_, i) => (
                        <line
                            key={`vl-right-${i}`}
                            x1="440"
                            y1={40 + i * 36}
                            x2="440"
                            y2={40 + i * 36 + 20}
                            stroke="#d1d5db"
                            strokeWidth="0.75"
                            strokeDasharray="2,2"
                        />
                    ))}

                    {Array.from({ length: 19 }).map((_, i) => (
                        <line
                            key={`hl-${i}`}
                            x1={35 + i * 30}
                            y1="210"
                            x2={35 + i * 30 + 15}
                            y2="210"
                            stroke="#d1d5db"
                            strokeWidth="0.75"
                            strokeDasharray="2,2"
                        />
                    ))}

                    {/* Зона A: Опен-спейс */}
                    <rect
                        x="20"
                        y="20"
                        width="190"
                        height="180"
                        rx="3"
                        fill="#eff6ff"
                        stroke="#3b82f6"
                        strokeWidth="1"
                        strokeDasharray="5,3"
                    />
                    <text x="30" y="40" fill="#1e40af" fontSize="12" fontWeight="bold">
                        Зона A: Опен-спейс
                    </text>

                    {/* Зона B: Кабинеты */}
                    <rect
                        x="230"
                        y="20"
                        width="200"
                        height="180"
                        rx="3"
                        fill="#f0fdfa"
                        stroke="#14b8a6"
                        strokeWidth="1"
                    />
                    <text x="240" y="40" fill="#0f766e" fontSize="12" fontWeight="bold">
                        Зона B: Кабинеты
                    </text>

                    {/* Столы в кабинетах */}
                    <rect
                        x="260"
                        y="50"
                        width="40"
                        height="30"
                        rx="2"
                        fill="none"
                        stroke="#0f766e"
                        strokeWidth="1"
                    />
                    <rect
                        x="310"
                        y="50"
                        width="40"
                        height="30"
                        rx="2"
                        fill="none"
                        stroke="#0f766e"
                        strokeWidth="1"
                    />
                    <rect
                        x="360"
                        y="50"
                        width="40"
                        height="30"
                        rx="2"
                        fill="none"
                        stroke="#0f766e"
                        strokeWidth="1"
                    />
                    <rect
                        x="260"
                        y="100"
                        width="40"
                        height="30"
                        rx="2"
                        fill="none"
                        stroke="#0f766e"
                        strokeWidth="1"
                    />
                    <rect
                        x="310"
                        y="100"
                        width="40"
                        height="30"
                        rx="2"
                        fill="none"
                        stroke="#0f766e"
                        strokeWidth="1"
                    />
                    <rect
                        x="360"
                        y="100"
                        width="40"
                        height="30"
                        rx="2"
                        fill="none"
                        stroke="#0f766e"
                        strokeWidth="1"
                    />
                    <rect
                        x="260"
                        y="150"
                        width="40"
                        height="30"
                        rx="2"
                        fill="none"
                        stroke="#0f766e"
                        strokeWidth="1"
                    />
                    <rect
                        x="310"
                        y="150"
                        width="40"
                        height="30"
                        rx="2"
                        fill="none"
                        stroke="#0f766e"
                        strokeWidth="1"
                    />
                    <rect
                        x="360"
                        y="150"
                        width="40"
                        height="30"
                        rx="2"
                        fill="none"
                        stroke="#0f766e"
                        strokeWidth="1"
                    />

                    {/* Зона C: Переговорные */}
                    <rect
                        x="20"
                        y="220"
                        width="190"
                        height="160"
                        rx="3"
                        fill="#fef9c3"
                        stroke="#ca8a04"
                        strokeWidth="1"
                    />
                    <text x="30" y="240" fill="#854d0e" fontSize="12" fontWeight="bold">
                        Зона C: Переговорные
                    </text>

                    {/* Столы в переговорных */}
                    <rect
                        x="53"
                        y="265"
                        width="45"
                        height="30"
                        rx="2"
                        fill="none"
                        stroke="#ca8a04"
                        strokeWidth="1"
                    />
                    <rect
                        x="133"
                        y="265"
                        width="45"
                        height="30"
                        rx="2"
                        fill="none"
                        stroke="#ca8a04"
                        strokeWidth="1"
                    />
                    <rect
                        x="53"
                        y="310"
                        width="45"
                        height="30"
                        rx="2"
                        fill="none"
                        stroke="#ca8a04"
                        strokeWidth="1"
                    />
                    <rect
                        x="133"
                        y="310"
                        width="45"
                        height="30"
                        rx="2"
                        fill="none"
                        stroke="#ca8a04"
                        strokeWidth="1"
                    />

                    {/* Зона D: Тихая зона */}
                    <rect
                        x="240"
                        y="220"
                        width="190"
                        height="160"
                        rx="3"
                        fill="#fae8ff"
                        stroke="#a855f7"
                        strokeWidth="1"
                    />
                    <text x="250" y="240" fill="#7e22ce" fontSize="12" fontWeight="bold">
                        Зона D: Тихая зона
                    </text>

                    {/* Перегородки в тихой зоне*/}
                    {/* Вертикальные перегородки между столами */}
                    <rect x="305" y="250" width="2" height="50" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="330" y="250" width="2" height="50" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="358" y="250" width="2" height="50" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="385" y="250" width="2" height="50" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />

                    <rect x="305" y="320" width="2" height="50" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="330" y="320" width="2" height="50" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="358" y="320" width="2" height="50" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="385" y="320" width="2" height="50" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />

                    {/* Горизонтальная перегородка между первым и вторым рядом */}
                    <rect x="250" y="305" width="170" height="2" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />

                    {/* Дополнительные короткие перегородки для образования ячеек */}
                    <rect x="270" y="265" width="30" height="2" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="300" y="265" width="30" height="2" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="330" y="265" width="30" height="2" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="360" y="265" width="30" height="2" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="390" y="265" width="25" height="2" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />

                    <rect x="270" y="335" width="30" height="2" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="300" y="335" width="30" height="2" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="330" y="335" width="30" height="2" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="360" y="335" width="30" height="2" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="390" y="335" width="25" height="2" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />

                    {/* Боковые перегородки для крайних мест */}
                    <rect x="250" y="250" width="2" height="50" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="414" y="250" width="2" height="50" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="250" y="320" width="2" height="50" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />
                    <rect x="414" y="320" width="2" height="50" fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.5" />

                    {/* Зона E: Зона отдыха */}
                    <rect
                        x="450"
                        y="20"
                        width="130"
                        height="180"
                        rx="3"
                        fill="#dcfce7"
                        stroke="#22c55e"
                        strokeWidth="1"
                    />
                    <text x="460" y="40" fill="#15803d" fontSize="12" fontWeight="bold">
                        Зона E: Зона отдыха
                    </text>

                    {/* Стена с телевизорами в центре зоны отдыха */}
                    <rect x="465" y="50" width="100" height="2" fill="#86efac" stroke="#22c55e" strokeWidth="1" />
                    <rect x="465" y="50" width="2" height="20" fill="#86efac" stroke="#22c55e" strokeWidth="1" />
                    <rect x="565" y="50" width="2" height="20" fill="#86efac" stroke="#22c55e" strokeWidth="1" />

                    {/* Телевизоры на стене */}
                    <rect x="485" y="52" width="20" height="10" fill="#a5c7e9" stroke="#a5c7e9" strokeWidth="1" />
                    <text x="495" y="60" fill="#f9fafb" fontSize="5" textAnchor="middle">TV</text>

                    <rect x="528" y="52" width="20" height="10" fill="#a5c7e9" stroke="#a5c7e9" strokeWidth="1" />
                    <text x="538" y="60" fill="#f9fafb" fontSize="5" textAnchor="middle">TV</text>

                    {/* Столики в зоне отдыха */}
                    <circle cx="480" cy="80" r="10" fill="none" stroke="#22c55e" strokeWidth="1" />
                    <circle cx="480" cy="120" r="10" fill="none" stroke="#22c55e" strokeWidth="1" />
                    <circle cx="480" cy="160" r="10" fill="none" stroke="#22c55e" strokeWidth="1" />
                    <circle cx="555" cy="80" r="10" fill="none" stroke="#22c55e" strokeWidth="1" />
                    <circle cx="555" cy="120" r="10" fill="none" stroke="#22c55e" strokeWidth="1" />
                    <circle cx="555" cy="160" r="10" fill="none" stroke="#22c55e" strokeWidth="1" />


                    {/* Кофе-зона */}
                    <rect
                        x="450"
                        y="220"
                        width="130"
                        height="160"
                        rx="3"
                        fill="#ffedd5"
                        stroke="#f97316"
                        strokeWidth="1"
                    />
                    <text x="460" y="240" fill="#c2410c" fontSize="12" fontWeight="bold">
                        Кофе-зона
                    </text>

                    {/* Кофемашина */}
                    <rect
                        x="470"
                        y="250"
                        width="90"
                        height="15"
                        rx="2"
                        fill="#fdba74"
                        stroke="#c2410c"
                        strokeWidth="1"
                    />
                    <text x="515" y="260" fill="#7c2d12" fontSize="7" textAnchor="middle">
                        Кофе
                    </text>

                    {/* Столики в кофе-зоне */}
                    <circle cx="475" cy="290" r="10" fill="none" stroke="#fb923c" strokeWidth="1" />
                    <circle cx="515" cy="290" r="10" fill="none" stroke="#fb923c" strokeWidth="1" />
                    <circle cx="555" cy="290" r="10" fill="none" stroke="#fb923c" strokeWidth="1" />
                    <circle cx="475" cy="330" r="10" fill="none" stroke="#fb923c" strokeWidth="1" />
                    <circle cx="515" cy="330" r="10" fill="none" stroke="#fb923c" strokeWidth="1" />
                    <circle cx="555" cy="330" r="10" fill="none" stroke="#fb923c" strokeWidth="1" />

                    {/* Туалеты */}
                    <rect
                        x="485"
                        y="355"
                        width="25"
                        height="20"
                        rx="2"
                        fill="#e2e8f0"
                        stroke="#64748b"
                        strokeWidth="1"
                    />
                    <text x="498" y="368" fill="#334155" fontSize="8" textAnchor="middle">
                        WC
                    </text>
                    <rect
                        x="520"
                        y="355"
                        width="25"
                        height="20"
                        rx="2"
                        fill="#e2e8f0"
                        stroke="#64748b"
                        strokeWidth="1"
                    />
                    <text x="533" y="368" fill="#334155" fontSize="8" textAnchor="middle">
                        WC
                    </text>


                    <circle cx="220" cy="60" r="2.5" fill="#9ca3af" />
                    <circle cx="220" cy="130" r="2.5" fill="#9ca3af" />
                    <circle cx="220" cy="250" r="2.5" fill="#9ca3af" />
                    <circle cx="220" cy="320" r="2.5" fill="#9ca3af" />

                    <circle cx="440" cy="60" r="2.5" fill="#9ca3af" />
                    <circle cx="440" cy="130" r="2.5" fill="#9ca3af" />
                    <circle cx="440" cy="250" r="2.5" fill="#9ca3af" />
                    <circle cx="440" cy="320" r="2.5" fill="#9ca3af" />

                    {/* Маркеры в горизонтальном коридоре */}
                    <circle cx="100" cy="210" r="2.5" fill="#9ca3af" />
                    <circle cx="170" cy="210" r="2.5" fill="#9ca3af" />
                    <circle cx="300" cy="210" r="2.5" fill="#9ca3af" />
                    <circle cx="370" cy="210" r="2.5" fill="#9ca3af" />
                    <circle cx="500" cy="210" r="2.5" fill="#9ca3af" />

                    {/* Направляющие стрелки в коридорах */}
                    <path d="M220,80 l-3,-6 l6,0 z" fill="#9ca3af" />
                    <path d="M220,170 l-3,-6 l6,0 z" fill="#9ca3af" />
                    <path d="M220,280 l-3,-6 l6,0 z" fill="#9ca3af" />
                    <path d="M220,350 l-3,-6 l6,0 z" fill="#9ca3af" />

                    <path d="M440,80 l-3,-6 l6,0 z" fill="#9ca3af" />
                    <path d="M440,170 l-3,-6 l6,0 z" fill="#9ca3af" />
                    <path d="M440,280 l-3,-6 l6,0 z" fill="#9ca3af" />
                    <path d="M440,350 l-3,-6 l6,0 z" fill="#9ca3af" />

                    <path d="M120,210 l6,-3 l0,6 z" fill="#9ca3af" />
                    <path d="M200,210 l6,-3 l0,6 z" fill="#9ca3af" />
                    <path d="M330,210 l6,-3 l0,6 z" fill="#9ca3af" />
                    <path d="M400,210 l6,-3 l0,6 z" fill="#9ca3af" />
                    <path d="M520,210 l6,-3 l0,6 z" fill="#9ca3af" />

                    {/* Обозначения направлений в коридорах */}
                    <text
                        x="228"
                        y="80"
                        fill="#6b7280"
                        fontSize="8"
                        fontWeight="500"
                        transform="rotate(90 228 80)"
                    >
                        → Зоны A, B
                    </text>
                    <text
                        x="228"
                        y="160"
                        fill="#6b7280"
                        fontSize="8"
                        fontWeight="500"
                        transform="rotate(90 228 160)"
                    >
                        → Зона E
                    </text>
                    <text
                        x="228"
                        y="260"
                        fill="#6b7280"
                        fontSize="8"
                        fontWeight="500"
                        transform="rotate(90 228 260)"
                    >
                        → Зоны C, D
                    </text>
                    <text
                        x="228"
                        y="340"
                        fill="#6b7280"
                        fontSize="8"
                        fontWeight="500"
                        transform="rotate(90 228 340)"
                    >
                        → Кофе-зона
                    </text>

                    <text
                        x="452"
                        y="80"
                        fill="#6b7280"
                        fontSize="8"
                        fontWeight="500"
                        transform="rotate(90 452 80)"
                    >
                        → Зона E
                    </text>
                    <text
                        x="452"
                        y="260"
                        fill="#6b7280"
                        fontSize="8"
                        fontWeight="500"
                        transform="rotate(90 452 260)"
                    >
                        → Кофе-зона
                    </text>
                    <text
                        x="452"
                        y="340"
                        fill="#6b7280"
                        fontSize="8"
                        fontWeight="500"
                        transform="rotate(90 452 340)"
                    >
                        → Туалеты
                    </text>

                    <text x="120" y="202" fill="#6b7280" fontSize="8" fontWeight="500">
                        → Зона C
                    </text>
                    <text x="300" y="202" fill="#6b7280" fontSize="8" fontWeight="500">
                        → Зона D
                    </text>
                    <text x="500" y="202" fill="#6b7280" fontSize="8" fontWeight="500">
                        → Кофе-зона
                    </text>

                    {/* Перекрестки коридоров */}
                    <circle cx="220" cy="210" r="5" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1"/>
                    <circle cx="440" cy="210" r="5" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1"/>

                    {/* Дверь */}
                    <rect x="215" y="380" width="10" height="5" fill="#475569"/>
                    <text x="220" y="375" fill="#475569" fontSize="8" textAnchor="middle">
                        ВХОД
                    </text>

                    {seats.map((seat) => (
                        <g
                            key={seat.id}
                            onClick={() => !seat.isOccupied && onSeatSelect(seat)}
                            style={{
                                cursor: seat.isOccupied ? 'not-allowed' : 'pointer',
                                pointerEvents: 'auto'
                            }}
                            data-seat="true"
                            data-seat-id={seat.id}
                        >
                            <rect
                                x={seat.x - 9}
                                y={seat.y - 9}
                                width="18"
                                height="18"
                                rx="2"
                                fill={
                                    selectedSeat?.id === seat.id
                                        ? '#bfdbfe'
                                        : seat.isOccupied
                                            ? '#f3f4f6'
                                            : seat.type === 'desk'
                                                ? '#dbeafe'
                                                : seat.type === 'office'
                                                    ? '#ccfbf1'
                                                    : seat.type === 'meeting'
                                                        ? '#fef9c3'
                                                        : seat.type === 'focus'
                                                            ? '#fae8ff'
                                                            : '#dcfce7'
                                }
                                stroke={
                                    selectedSeat?.id === seat.id
                                        ? '#3b82f6'
                                        : seat.isOccupied
                                            ? '#d1d5db'
                                            : seat.type === 'desk'
                                                ? '#60a5fa'
                                                : seat.type === 'office'
                                                    ? '#2dd4bf'
                                                    : seat.type === 'meeting'
                                                        ? '#facc15'
                                                        : seat.type === 'focus'
                                                            ? '#d946ef'
                                                            : seat.type === 'focus'
                                                                ? '#d946ef'
                                                                : '#4ade80'
                                }
                                strokeWidth="1"
                                data-seat="true"
                            />
                            <text
                                x={seat.x}
                                y={seat.y + 3}
                                textAnchor="middle"
                                fontSize="7"
                                fontWeight="500"
                                fill={
                                    seat.isOccupied
                                        ? '#9ca3af'
                                        : seat.type === 'desk'
                                            ? '#1e40af'
                                            : seat.type === 'office'
                                                ? '#0f766e'
                                                : seat.type === 'meeting'
                                                    ? '#854d0e'
                                                    : seat.type === 'focus'
                                                        ? '#7e22ce'
                                                        : '#15803d'
                                }
                                data-seat="true"
                            >
                                {seat.name}
                            </text>
                            {seat.isOccupied && (
                                <path
                                    transform={`translate(${seat.x - 3}, ${seat.y + 5}) scale(0.4)`}
                                    d="M4 8V6a4 4 0 118 0v2m1 0h2v8a2 2 0 01-2 2H3a2 2 0 01-2-2v-8h2m2 0h8"
                                    stroke="#9ca3af"
                                    strokeWidth="2"
                                    fill="none"
                                    data-seat="true"
                                />
                            )}
                        </g>
                    ))}

                    <rect x="20" y="385" width="560" height="1" stroke="#94a3b8" strokeWidth="1"/>
                    <circle cx="30" cy="395" r="5" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1"/>
                    <text x="40" y="398" fill="#64748b" fontSize="8">
                        Рабочее место
                    </text>
                    <circle cx="100" cy="395" r="5" fill="#ccfbf1" stroke="#2dd4bf" strokeWidth="1"/>
                    <text x="110" y="398" fill="#64748b" fontSize="8">
                        Кабинет
                    </text>
                    <circle cx="170" cy="395" r="5" fill="#fef9c3" stroke="#facc15" strokeWidth="1"/>
                    <text x="180" y="398" fill="#64748b" fontSize="8">
                        Переговорная
                    </text>
                    <circle cx="250" cy="395" r="5" fill="#fae8ff" stroke="#d946ef" strokeWidth="1"/>
                    <text x="260" y="398" fill="#64748b" fontSize="8">
                        Тихая зона
                    </text>
                    <circle cx="320" cy="395" r="5" fill="#dcfce7" stroke="#4ade80" strokeWidth="1"/>
                    <text x="330" y="398" fill="#64748b" fontSize="8">
                        Зона отдыха
                    </text>
                    <circle cx="400" cy="395" r="5" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1"/>
                    <text x="410" y="398" fill="#64748b" fontSize="8">
                        Занято
                    </text>
                    <circle cx="470" cy="395" r="5" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.5"/>
                    <text x="480" y="398" fill="#64748b" fontSize="8">
                        Выбрано
                    </text>
                </svg>
            </div>
        </div>
    );
};

export default CoworkingMap;
