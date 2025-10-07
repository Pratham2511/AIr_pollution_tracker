module.exports = {
	up: async (queryInterface, Sequelize) => {
		if (queryInterface.sequelize.getDialect() !== 'postgres') {
			return;
		}

		const defaultTimestamp = queryInterface.sequelize.getDialect() === 'sqlite'
			? Sequelize.literal('CURRENT_TIMESTAMP')
			: queryInterface.sequelize.fn('NOW');

		await queryInterface.createTable('analytics_refresh_log', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			refreshedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: defaultTimestamp
			},
			durationMs: {
				allowNull: true,
				type: Sequelize.INTEGER
			}
		});

		await queryInterface.sequelize.query(`
			CREATE OR REPLACE FUNCTION refresh_city_pollution_analytics()
			RETURNS VOID AS $$
			DECLARE
				start_time TIMESTAMP := CLOCK_TIMESTAMP();
				end_time TIMESTAMP;
			BEGIN
				REFRESH MATERIALIZED VIEW CONCURRENTLY city_pollution_analytics;
				end_time := CLOCK_TIMESTAMP();
				INSERT INTO analytics_refresh_log (refreshed_at, duration_ms)
				VALUES (end_time, EXTRACT(MILLISECOND FROM end_time - start_time));
			END;
			$$ LANGUAGE plpgsql;
		`);
	},

	down: async (queryInterface) => {
		if (queryInterface.sequelize.getDialect() !== 'postgres') {
			return;
		}

		await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS refresh_city_pollution_analytics();');
		await queryInterface.dropTable('analytics_refresh_log');
	}
};
