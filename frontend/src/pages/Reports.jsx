import React, { useEffect, useState } from 'react';
import api from '../utils/api';

function Reports() {
    const [dailySummary, setDailySummary] = useState(null);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    useEffect(() => {
        fetchDailySummary(selectedDate);
    }, [selectedDate]);

    const fetchDailySummary = async (date) => {
        try {
            const response = await api.get('/reports/daily-summary', {
                params: { date }
            });

            if (response.data.success) {
                setDailySummary(response.data.data);
                setError('');
            } else {
                setError(response.data.message || 'Failed to fetch daily summary');
            }
        } catch (error) {
            console.error(error);
            setError('Failed to load daily summary. Please try again later.');
        }
    };


    return (
        <div>


            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Daily Summary</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Showing report for: <span className="font-medium">{selectedDate}</span>
                    </p>
                </div>

                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>


            {dailySummary && (
                <>
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow p-6">
                            <p className="text-sm text-gray-500">Total Employees</p>
                            <p className="text-3xl font-bold mt-2">
                                {dailySummary.team_summary.total_employees}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow p-6">
                            <p className="text-sm text-gray-500">Total Check-ins</p>
                            <p className="text-3xl font-bold mt-2 text-blue-600">
                                {dailySummary.team_summary.total_checkins}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow p-6">
                            <p className="text-sm text-gray-500">Clients Visited</p>
                            <p className="text-3xl font-bold mt-2">
                                {dailySummary.team_summary.total_clients_visited}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow p-6">
                            <p className="text-sm text-gray-500">Working Hours</p>
                            <p className="text-3xl font-bold mt-2 text-green-600">
                                {dailySummary.team_summary.total_working_hours}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold">Per Employee Summary</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 text-sm text-gray-500">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium">Employee</th>
                                        <th className="px-6 py-3 text-center font-medium">Check-ins</th>
                                        <th className="px-6 py-3 text-center font-medium">Clients</th>
                                        <th className="px-6 py-3 text-center font-medium">Hours</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {dailySummary.employees.map(emp => (
                                        <tr key={emp.employee_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-800">
                                                {emp.name}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                                                    {emp.checkins}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                                                    {emp.clients_visited}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center font-semibold">
                                                {emp.working_hours ?? 0}h
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Reports;
