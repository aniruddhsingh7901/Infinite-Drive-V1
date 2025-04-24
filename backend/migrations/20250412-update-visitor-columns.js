'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the visitors table exists
      const tableExists = await queryInterface.showAllTables()
        .then(tables => tables.includes('visitors'));
      
      if (!tableExists) {
        console.log('Visitors table does not exist, skipping migration');
        return;
      }

      // Alter columns to TEXT type
      await queryInterface.changeColumn('visitors', 'ip', {
        type: Sequelize.TEXT,
        allowNull: false
      });

      await queryInterface.changeColumn('visitors', 'path', {
        type: Sequelize.TEXT,
        allowNull: false
      });

      await queryInterface.changeColumn('visitors', 'referrer', {
        type: Sequelize.TEXT,
        allowNull: true
      });

      await queryInterface.changeColumn('visitors', 'country', {
        type: Sequelize.TEXT,
        allowNull: true
      });

      await queryInterface.changeColumn('visitors', 'city', {
        type: Sequelize.TEXT,
        allowNull: true
      });

      await queryInterface.changeColumn('visitors', 'sessionId', {
        type: Sequelize.TEXT,
        allowNull: false
      });

      console.log('Successfully updated Visitor table columns to TEXT type');
    } catch (error) {
      console.error('Error updating Visitor table columns:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Check if the visitors table exists
      const tableExists = await queryInterface.showAllTables()
        .then(tables => tables.includes('visitors'));
      
      if (!tableExists) {
        console.log('Visitors table does not exist, skipping migration');
        return;
      }

      // Revert columns back to VARCHAR(255)
      await queryInterface.changeColumn('visitors', 'ip', {
        type: Sequelize.STRING(255),
        allowNull: false
      });

      await queryInterface.changeColumn('visitors', 'path', {
        type: Sequelize.STRING(255),
        allowNull: false
      });

      await queryInterface.changeColumn('visitors', 'referrer', {
        type: Sequelize.STRING(255),
        allowNull: true
      });

      await queryInterface.changeColumn('visitors', 'country', {
        type: Sequelize.STRING(255),
        allowNull: true
      });

      await queryInterface.changeColumn('visitors', 'city', {
        type: Sequelize.STRING(255),
        allowNull: true
      });

      await queryInterface.changeColumn('visitors', 'sessionId', {
        type: Sequelize.STRING(255),
        allowNull: false
      });

      console.log('Successfully reverted Visitor table columns to VARCHAR(255) type');
    } catch (error) {
      console.error('Error reverting Visitor table columns:', error);
      throw error;
    }
  }
};
