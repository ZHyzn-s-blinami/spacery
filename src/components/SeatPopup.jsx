import { useNavigate } from 'react-router-dom';

export const SeatPopup = ({ seat, onClose }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      <div className="bg-white rounded-lg p-6 shadow-xl relative z-10 w-64">
        <h3 className="text-lg font-medium mb-4 text-center">Выберите действие</h3>

        <div className="flex flex-col space-y-3">
          <button
            onClick={() => navigate(`/admin/booking/${seat.name}/place`)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Список бронирований
          </button>

          <button
            onClick={() => navigate(`/admin/ticket/${seat.name}/place`)}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            Список тикетов
          </button>
        </div>
      </div>
    </div>
  );
};
