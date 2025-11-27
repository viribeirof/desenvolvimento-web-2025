
const Toast = ({error, setError}) => {
    return (
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
            <div className="toast text-bg-danger bg-opacity-50 show" role="alert" aria-live="assertive" aria-atomic="true">
                <div className="toast-header">
                    <strong className="me-auto">Erro</strong>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => setError(null)}
                    >
                    </button>
                </div>
                <div className="toast-body">
                    {error}
                </div>
            </div>
        </div>
    )
}

export default Toast