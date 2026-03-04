/**
 * PageSkeleton — full-viewport pulse skeleton shown while lazy page chunks load
 * or while the AuthProvider is initializing the session.
 */
export default function PageSkeleton() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                backgroundColor: '#f8f9fa',
                fontFamily: 'K2D, system-ui, sans-serif',
            }}
        >
            {/* ── Nav bar skeleton ── */}
            <div
                style={{
                    height: '56px',
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid #e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                    gap: '12px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
            >
                <ShimmerBox width="36px" height="36px" borderRadius="50%" />
                <ShimmerBox width="120px" height="16px" borderRadius="6px" />
                <div style={{ flex: 1 }} />
                <ShimmerBox width="36px" height="36px" borderRadius="50%" />
            </div>

            {/* ── Content area skeleton ── */}
            <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <ShimmerBox width="60%" height="24px" borderRadius="8px" />
                <ShimmerBox width="100%" height="120px" borderRadius="12px" />
                <ShimmerBox width="100%" height="80px" borderRadius="12px" />
                <div style={{ display: 'flex', gap: '12px' }}>
                    <ShimmerBox width="50%" height="80px" borderRadius="12px" />
                    <ShimmerBox width="50%" height="80px" borderRadius="12px" />
                </div>
                <ShimmerBox width="100%" height="100px" borderRadius="12px" />
            </div>

            {/* ── Bottom nav skeleton ── */}
            <div
                style={{
                    height: '60px',
                    backgroundColor: '#ffffff',
                    borderTop: '1px solid #e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    padding: '0 12px',
                }}
            >
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <ShimmerBox width="24px" height="24px" borderRadius="6px" />
                        <ShimmerBox width="36px" height="8px" borderRadius="4px" />
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes vn-shimmer {
                    0% { background-position: -400px 0; }
                    100% { background-position: 400px 0; }
                }
                .vn-shimmer {
                    background: linear-gradient(90deg, #e9ecef 25%, #f3f4f6 50%, #e9ecef 75%);
                    background-size: 800px 100%;
                    animation: vn-shimmer 1.4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

function ShimmerBox({
    width,
    height,
    borderRadius,
}: {
    width: string;
    height: string;
    borderRadius: string;
}) {
    return (
        <div
            className="vn-shimmer"
            style={{ width, height, borderRadius, flexShrink: 0 }}
        />
    );
}
