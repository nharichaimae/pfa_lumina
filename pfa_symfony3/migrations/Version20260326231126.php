<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260326231126 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE password_setup_token DROP FOREIGN KEY fk_password_setup_token_user');
        $this->addSql('ALTER TABLE password_setup_token CHANGE expires_at expires_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('DROP INDEX token ON password_setup_token');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_466003875F37A13B ON password_setup_token (token)');
        $this->addSql('DROP INDEX fk_password_setup_token_user ON password_setup_token');
        $this->addSql('CREATE INDEX IDX_46600387A76ED395 ON password_setup_token (user_id)');
        $this->addSql('ALTER TABLE password_setup_token ADD CONSTRAINT fk_password_setup_token_user FOREIGN KEY (user_id) REFERENCES utilisateur (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE utilisateur ADD reset_token VARCHAR(255) DEFAULT NULL, ADD reset_token_expires_at DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE password_setup_token DROP FOREIGN KEY FK_46600387A76ED395');
        $this->addSql('ALTER TABLE password_setup_token CHANGE expires_at expires_at DATETIME NOT NULL');
        $this->addSql('DROP INDEX uniq_466003875f37a13b ON password_setup_token');
        $this->addSql('CREATE UNIQUE INDEX token ON password_setup_token (token)');
        $this->addSql('DROP INDEX idx_46600387a76ed395 ON password_setup_token');
        $this->addSql('CREATE INDEX fk_password_setup_token_user ON password_setup_token (user_id)');
        $this->addSql('ALTER TABLE password_setup_token ADD CONSTRAINT FK_46600387A76ED395 FOREIGN KEY (user_id) REFERENCES utilisateur (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE utilisateur DROP reset_token, DROP reset_token_expires_at');
    }
}
