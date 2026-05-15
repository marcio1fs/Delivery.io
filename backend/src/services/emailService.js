import nodemailer from 'nodemailer';
import logger from './logger.js';

// Configurar transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Enviar email de confirmação de pedido
export const sendOrderConfirmation = async (order, user, restaurant) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Delivery App'}" <${process.env.FROM_EMAIL}>`,
    to: user.email,
    subject: `Pedido Confirmado - #${order._id.toString().slice(-6)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Pedido Confirmado! 🎉</h1>
        <p>Olá ${user.name},</p>
        <p>Seu pedido no <strong>${restaurant.name}</strong> foi confirmado!</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #555;">Detalhes do Pedido</h2>
          <p><strong>Número do Pedido:</strong> #${order._id.toString().slice(-6)}</p>
          <p><strong>Total:</strong> R$ ${order.total.toFixed(2)}</p>
          <p><strong>Endereço de Entrega:</strong> ${order.deliveryAddress.street}, ${order.deliveryAddress.number} - ${order.deliveryAddress.neighborhood}</p>
          <p><strong>Tempo Estimado:</strong> ${order.estimatedDeliveryTime || '30-40'} minutos</p>
        </div>

        <p>Você pode acompanhar seu pedido em tempo real pelo aplicativo.</p>
        
        <p style="color: #666; font-size: 14px;">Obrigado por usar nosso serviço!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Email de confirmação enviado para ${user.email}`);
    return { success: true };
  } catch (error) {
    logger.error('Erro ao enviar email de confirmação:', error);
    return { success: false, error: error.message };
  }
};

// Enviar email de atualização de status do pedido
export const sendOrderStatusUpdate = async (order, user, restaurant, newStatus) => {
  const transporter = createTransporter();

  const statusMessages = {
    confirmed: 'seu pedido foi confirmado pelo restaurante',
    preparing: 'seu pedido está sendo preparado',
    ready: 'seu pedido está pronto e aguardando o entregador',
    on_the_way: 'seu pedido saiu para entrega!',
    delivered: 'seu pedido foi entregue! 🎉',
    cancelled: 'seu pedido foi cancelado',
  };

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Delivery App'}" <${process.env.FROM_EMAIL}>`,
    to: user.email,
    subject: `Atualização do Pedido - #${order._id.toString().slice(-6)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Atualização do Pedido</h1>
        <p>Olá ${user.name},</p>
        <p>Temos uma atualização sobre seu pedido no <strong>${restaurant.name}</strong>:</p>
        
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h2 style="color: #1976d2; margin: 0;">${statusMessages[newStatus] || 'Status atualizado'}</h2>
        </div>

        <p><strong>Número do Pedido:</strong> #${order._id.toString().slice(-6)}</p>
        
        ${newStatus === 'on_the_way' ? `
          <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Entregador:</strong> ${order.driver?.name || 'A caminho'}</p>
            ${order.driver?.phone ? `<p style="margin: 10px 0 0 0;"><strong>Telefone:</strong> ${order.driver.phone}</p>` : ''}
          </div>
        ` : ''}

        <p style="color: #666; font-size: 14px;">Continue acompanhando pelo aplicativo!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Email de atualização enviado para ${user.email}`);
    return { success: true };
  } catch (error) {
    logger.error('Erro ao enviar email de atualização:', error);
    return { success: false, error: error.message };
  }
};

// Enviar email de boas-vindas
export const sendWelcomeEmail = async (user) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Delivery App'}" <${process.env.FROM_EMAIL}>`,
    to: user.email,
    subject: 'Bem-vindo ao Delivery App! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Bem-vindo! 🎉</h1>
        <p>Olá ${user.name},</p>
        <p>É um prazer ter você conosco! Agora você pode fazer pedidos dos melhores restaurantes da sua região.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
             style="background-color: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Fazer Meu Primeiro Pedido
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">Em caso de dúvidas, entre em contato com nosso suporte.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Email de boas-vindas enviado para ${user.email}`);
    return { success: true };
  } catch (error) {
    logger.error('Erro ao enviar email de boas-vindas:', error);
    return { success: false, error: error.message };
  }
};

// Enviar email de recuperação de senha
export const sendPasswordResetEmail = async (user, resetToken) => {
  const transporter = createTransporter();

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Delivery App'}" <${process.env.FROM_EMAIL}>`,
    to: user.email,
    subject: 'Recuperação de Senha',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Recuperação de Senha</h1>
        <p>Olá ${user.name},</p>
        <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para continuar:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Redefinir Senha
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">Este link expira em 1 hora. Se você não solicitou esta alteração, ignore este email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Email de recuperação enviado para ${user.email}`);
    return { success: true };
  } catch (error) {
    logger.error('Erro ao enviar email de recuperação:', error);
    return { success: false, error: error.message };
  }
};

// Enviar email promocional
export const sendPromotionalEmail = async (user, promotion) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Delivery App'}" <${process.env.FROM_EMAIL}>`,
    to: user.email,
    subject: promotion.subject || 'Oferta Especial para Você! 🎁',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff6b6b;">${promotion.title || 'Oferta Especial!'}</h1>
        <p>Olá ${user.name},</p>
        <p>${promotion.message}</p>
        
        ${promotion.couponCode ? `
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 18px;"><strong>Use o cupom:</strong></p>
            <p style="font-size: 32px; color: #ff6b6b; margin: 10px 0;">${promotion.couponCode}</p>
          </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${promotion.actionUrl || process.env.FRONTEND_URL || 'http://localhost:5173'}" 
             style="background-color: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            ${promotion.actionText || 'Aproveitar Oferta'}
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">${promotion.terms || ''}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Email promocional enviado para ${user.email}`);
    return { success: true };
  } catch (error) {
    logger.error('Erro ao enviar email promocional:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPromotionalEmail,
};
