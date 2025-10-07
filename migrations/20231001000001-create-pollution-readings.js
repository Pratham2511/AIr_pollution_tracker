module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(160)
      },
      slug: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(180)
      },
      country: {
        allowNull: false,
        type: Sequelize.STRING(80)
      },
      isoCode: {
        allowNull: true,
        type: Sequelize.STRING(10)
      },
      region: {
        allowNull: true,
        type: Sequelize.STRING(120)
      },
      latitude: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      longitude: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      population: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      timezone: {
        allowNull: true,
        type: Sequelize.STRING(80)
      },
      isIndian: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('cities', ['name']);
    await queryInterface.addIndex('cities', ['country']);
    await queryInterface.addIndex('cities', ['isIndian']);

    await queryInterface.createTable('pollution_readings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cityId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'cities',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      recordedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      aqi: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      aqiCategory: {
        allowNull: false,
        type: Sequelize.STRING(40)
      },
      dominantPollutant: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      pm25: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      pm10: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      co: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      no2: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      so2: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      o3: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      temperature: {
        allowNull: true,
        type: Sequelize.FLOAT
      },
      humidity: {
        allowNull: true,
        type: Sequelize.FLOAT
      },
      windSpeed: {
        allowNull: true,
        type: Sequelize.FLOAT
      },
      dataSource: {
        allowNull: false,
        defaultValue: 'synthetic-model',
        type: Sequelize.STRING(80)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('pollution_readings', ['cityId', 'recordedAt']);
    await queryInterface.addIndex('pollution_readings', ['recordedAt']);
    await queryInterface.addIndex('pollution_readings', ['aqiCategory']);

    await queryInterface.createTable('city_daily_summaries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cityId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'cities',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      summaryDate: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      avgAqi: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      maxAqi: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      minAqi: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      dominantPollutant: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      avgPm25: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      avgPm10: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      avgCo: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      avgNo2: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      avgSo2: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      avgO3: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      trendScore: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('city_daily_summaries', ['cityId', 'summaryDate'], { unique: true });
    await queryInterface.addIndex('city_daily_summaries', ['summaryDate']);

    await queryInterface.createTable('tracked_cities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      cityId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'cities',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      alias: {
        allowNull: true,
        type: Sequelize.STRING(120)
      },
      notificationThreshold: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addConstraint('tracked_cities', {
      fields: ['userId', 'cityId'],
      type: 'unique',
      name: 'tracked_cities_user_city_unique'
    });

    await queryInterface.createTable('otp_tokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING(160)
      },
      otpCode: {
        allowNull: false,
        type: Sequelize.STRING(6)
      },
      expiresAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      consumedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      attemptCount: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      ipAddress: {
        allowNull: true,
        type: Sequelize.STRING(64)
      },
      userAgent: {
        allowNull: true,
        type: Sequelize.STRING(255)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('otp_tokens', ['email']);
    await queryInterface.addIndex('otp_tokens', ['expiresAt']);

    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS city_pollution_analytics AS
        SELECT
          c.id AS city_id,
          c.name AS city_name,
          c.country,
          c.region,
          c.is_indian,
          d.summary_date,
          d.avg_aqi,
          d.max_aqi,
          d.min_aqi,
          d.dominant_pollutant,
          d.avg_pm25,
          d.avg_pm10,
          d.avg_co,
          d.avg_no2,
          d.avg_so2,
          d.avg_o3,
          d.trend_score
        FROM city_daily_summaries d
        INNER JOIN cities c ON c.id = d.city_id;
      `);

      await queryInterface.addIndex('city_pollution_analytics', ['summary_date']);
      await queryInterface.addIndex('city_pollution_analytics', ['country']);
      await queryInterface.addIndex('city_pollution_analytics', ['is_indian']);
    }
  },

  down: async (queryInterface) => {
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS city_pollution_analytics');
    }
    await queryInterface.dropTable('otp_tokens');
    await queryInterface.dropTable('tracked_cities');
    await queryInterface.dropTable('city_daily_summaries');
    await queryInterface.dropTable('pollution_readings');
    await queryInterface.dropTable('cities');
  }
};
