import React, { useState } from 'react';

const Login = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // GitHub ActionsのSecretsで設定された環境変数を使用
        const validPassword = process.env.REACT_APP_PASSWORD;

        if (!validPassword) {
            console.error('REACT_APP_PASSWORD is not set');
            // ユーザーには汎用的なエラーを表示するか、あるいは設定ミスであることを伝える（内部利用ツールなのでわかりやすく）
            setError('システム設定エラー：パスワードが未設定です');
            return;
        }

        if (password === validPassword) {
            onLogin();
        } else {
            setError('パスワードが間違っています');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        TD Scoreboard
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        アクセスするにはパスワードを入力してください
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="password" class="sr-only">パスワード</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="パスワード"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            ログイン
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
